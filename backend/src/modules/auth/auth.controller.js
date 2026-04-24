const authService = require('./auth.service');
const logger = require('../../utils/logger');

exports.register = async(req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: 'Please provide complete information'
            });
        }

        if (!['student', 'instructor'].includes(role)) {
            return res.status(400).json({
                message: 'Invalid role'
            });
        }

        const user = await authService.register({ name, email, password, role });
        res.status(201).json({
            message: 'Registration successful',
            user
        });
    } catch(error) {
        logger.error(`Register Error: ${error.message}`, {stack: error.stack});

        if (error.code === '23505') {
            return res.status(409).json({
                message: 'This email has already been used'
            })
        }

        res.status(500).json({ message: 'Internal Server Error' })
    }
};

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please enter your email and password'
            });
        }

        const data = await authService.login({ email, password });

        res.status(200).json(data);
    } catch(error) {
        if (error.status === 401) {
            logger.warn(`Failed login attempt for: ${req.body.email}`);
            return res.status(401).json({ message: error.message });
        }

        logger.error(`Login Error: ${error.message}`, { stack: error.stack });
        res.status(error.status || 500).json({ message: 'Internal Server Error' });
    }
};