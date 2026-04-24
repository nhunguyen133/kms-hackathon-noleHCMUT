/*
  Seed data (Neon Postgres)

  Contract:
  - Idempotent: can be run multiple times.
  - Creates:
    - 1 instructor, 5 students
    - 1 course + 10 lessons
    - 1 quiz per lesson + questions (easy/medium/hard)
    - enrollments for all students

  Notes:
  - Uses bcryptjs to generate password_hash like the real auth flow.
*/

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { pool } = require('./index');

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL in environment (.env)');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // --- Users
  const plainPassword = '123456';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const instructorEmail = 'linh.teacher@gmail.com';
    const { rows: [instructor] } = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'instructor')
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name, email, role`,
  ['Linh Teacher', instructorEmail, passwordHash]
    );

    const studentEmails = [
      'an.student1@gmail.com',
      'binh.student2@gmail.com',
      'chi.student3@gmail.com',
      'dung.student4@gmail.com',
      'em.student5@gmail.com',
    ];
    const students = [];
    for (let i = 0; i < studentEmails.length; i++) {
      const email = studentEmails[i];
      const { rows: [student] } = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'student')
         ON CONFLICT (email)
         DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name, email, role`,
  [`Student ${i + 1}`, email, passwordHash]
      );
      students.push(student);

      // Ensure learning profile exists (schema uses PK user_id)
      await client.query(
  `INSERT INTO learning_profiles (user_id, onboarding_completed, weekly_study_goal, streak_count, last_active_date)
   VALUES ($1, false, 5, 0, CURRENT_DATE)
         ON CONFLICT (user_id) DO NOTHING`,
        [student.id]
      );
    }

    // --- Course
    const { rows: [course] } = await client.query(
      `INSERT INTO courses (title, description, teacher_id, subject, is_published)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id`,
  ['Critical Thinking Basics', 'Demo course to test the backend.', instructor.id, 'critical-thinking']
    );

    // If the course already existed, the above would create duplicates.
    // So we try to reuse an existing course for this instructor/title first.
    // (Do it after insert for simplicity: if duplicates exist, we keep the earliest one.)
    const { rows: [courseCanonical] } = await client.query(
      `SELECT id
       FROM courses
       WHERE teacher_id = $1 AND title = $2
       ORDER BY created_at ASC
       LIMIT 1`,
  [instructor.id, 'Critical Thinking Basics']
    );
    const courseId = courseCanonical?.id ?? course.id;

    // --- Lessons
  const topics = ['logic', 'critical-thinking', 'fallacies', 'probability', 'problem-solving'];
    const lessonIds = [];

    // Create lessons only if not already present
    const { rows: existingLessons } = await client.query(
      `SELECT id, "order" FROM lessons WHERE course_id = $1`,
      [courseId]
    );
    if (existingLessons.length === 0) {
      for (let i = 0; i < 10; i++) {
        const topic = topics[i % topics.length];
        const { rows: [lesson] } = await client.query(
          `INSERT INTO lessons (course_id, title, content, topic, difficulty_level, "order", is_published)
           VALUES ($1, $2, $3, $4, 'medium', $5, true)
           RETURNING id`,
          [
            courseId,
            `Lesson ${i + 1}: ${topic}`,
            `Demo content for topic: ${topic}.`,
            topic,
            i + 1,
          ]
        );
        lessonIds.push(lesson.id);
      }
    } else {
      const { rows } = await client.query(
        `SELECT id FROM lessons WHERE course_id = $1 ORDER BY "order" ASC LIMIT 10`,
        [courseId]
      );
      lessonIds.push(...rows.map(r => r.id));
    }

    // --- Enrollments
    for (const s of students) {
      await client.query(
        `INSERT INTO enrollments (student_id, course_id)
         VALUES ($1, $2)
         ON CONFLICT (student_id, course_id) DO NOTHING`,
        [s.id, courseId]
      );
    }

    // --- Quizzes + Questions
    const difficultyLevels = ['easy', 'medium', 'hard'];
    for (let li = 0; li < lessonIds.length; li++) {
      const lessonId = lessonIds[li];
      const { rows: [quiz] } = await client.query(
        `INSERT INTO quizzes (lesson_id, title)
         VALUES ($1, $2)
         RETURNING id`,
  [lessonId, `Quiz for Lesson ${li + 1}`]
      );

      for (const diff of difficultyLevels) {
        // 2 questions per difficulty
        for (let qi = 0; qi < 2; qi++) {
          const content = `(${diff}) Question ${qi + 1} - Lesson ${li + 1}: choose the best answer.`;
          const options = [
            { key: 'A', text: 'Answer A' },
            { key: 'B', text: 'Answer B' },
            { key: 'C', text: 'Answer C' },
            { key: 'D', text: 'Answer D' },
          ];
          const correct = 'A';

          await client.query(
            `INSERT INTO questions (quiz_id, content, options, correct_answer, topic, difficulty_level)
             VALUES ($1, $2, $3::jsonb, $4, $5, $6)`,
            [quiz.id, content, JSON.stringify(options), correct, topics[li % topics.length], diff]
          );
        }
      }
    }

    await client.query('COMMIT');

    // Summary
    const { rows: [{ count: usersCount }] } = await client.query('SELECT COUNT(*)::int AS count FROM users');
    const { rows: [{ count: coursesCount }] } = await client.query('SELECT COUNT(*)::int AS count FROM courses');
    const { rows: [{ count: lessonsCount }] } = await client.query('SELECT COUNT(*)::int AS count FROM lessons');
    const { rows: [{ count: questionsCount }] } = await client.query('SELECT COUNT(*)::int AS count FROM questions');

    console.log('Seed completed. Current totals:');
    console.log({ usersCount, coursesCount, lessonsCount, questionsCount });

    // Print a deterministic snapshot for backend testing
    const { rows: lessonsSnap } = await client.query(
      `SELECT id, title, topic, "order" FROM lessons WHERE course_id = $1 ORDER BY "order" ASC LIMIT 3`,
      [courseId]
    );
    const firstLessonId = lessonsSnap[0]?.id;
    const { rows: [quizSnap] } = firstLessonId
      ? await client.query(`SELECT id, title FROM quizzes WHERE lesson_id = $1 ORDER BY created_at ASC LIMIT 1`, [firstLessonId])
      : { rows: [null] };

    const firstQuizId = quizSnap?.id;
    const { rows: questionsSnap } = firstQuizId
      ? await client.query(
          `SELECT id, difficulty_level, topic, correct_answer
           FROM questions
           WHERE quiz_id = $1
           ORDER BY created_at ASC
           LIMIT 3`,
          [firstQuizId]
        )
      : { rows: [] };

  console.log('\n=== SEED SNAPSHOT (copy for tests/Postman) ===');
  console.log('AUTH (password for all accounts):', plainPassword);
    console.log('INSTRUCTOR:', { id: instructor.id, email: instructorEmail, role: 'instructor' });
    console.log('STUDENTS:', students.map((s) => ({ id: s.id, email: s.email, role: 'student' })));
  console.log('COURSE:', { id: courseId, title: 'Critical Thinking Basics' });
    console.log('LESSONS (first 3):', lessonsSnap);
    console.log('QUIZ (lesson 1):', quizSnap);
    console.log('QUESTIONS (first 3):', questionsSnap);

  console.log('\nSample API payloads:');
    console.log('POST /api/auth/login', { email: instructorEmail, password: plainPassword });
    console.log('POST /api/auth/login', { email: studentEmails[0], password: plainPassword });
    if (firstLessonId) {
      console.log('GET  /api/quiz/:lessonId/start', { lessonId: firstLessonId });
    }
    if (questionsSnap[0]) {
      console.log('POST /api/quiz/answer', {
        lessonId: firstLessonId,
        questionId: questionsSnap[0].id,
        answer: 'A'
      });
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed. Rolled back.');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
