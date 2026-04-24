const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db');

exports.register = async({ name, email, password, role }) => {
    const hash = await bcrypt.hash(password, 10);
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const { rows } = await client.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
            [name, email, hash, role]
        );
        const user = rows[0];

        if (role === 'student') {
            await client.query(
                'INSERT INTO learning_profiles (user_id) VALUES ($1)',
                [user.id]
            );
        }

        await client.query('COMMIT');
        return user;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

exports.login = async({ email, password }) => {
    const { rows } = await db.query(
        'SELECT * FROM users WHERE email = $1', [email]
    );
    const user = rows[0];

    if (!user) {
        throw{ status: 401, message: 'Incorrect email or password' };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        throw { status: 401, message: 'Incorrect email or password' };
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    return { 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    };
}