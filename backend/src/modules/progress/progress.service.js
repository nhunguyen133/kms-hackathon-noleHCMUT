const db = require("../../db");

function assertUuid(id, name = "id") {
  if (!id || typeof id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    throw { status: 400, message: `Invalid ${name}` };
  }
}

exports.getStudentProgress = async (studentId) => {
  assertUuid(studentId, "student id");

  // 1. Get learning profile
  const { rows: profileRows } = await db.query(
    `SELECT learning_style, goals, weak_topics, weekly_study_goal, streak_count, last_active_date
     FROM learning_profiles
     WHERE user_id = $1`,
    [studentId]
  );
  const profile = profileRows[0] || null;

  // 2. Get enrolled courses and their progress
  const { rows: courses } = await db.query(
    `SELECT
        c.id AS course_id,
        c.title,
        COALESCE(les.total_lessons, 0)::int AS total_lessons,
        COALESCE(comp.completed_lessons, 0)::int AS completed_lessons
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     LEFT JOIN (
        SELECT course_id, COUNT(*) AS total_lessons
        FROM lessons
        GROUP BY course_id
     ) les ON les.course_id = c.id
     LEFT JOIN (
        SELECT l.course_id, COUNT(DISTINCT s.lesson_id) AS completed_lessons
        FROM study_sessions s
        JOIN lessons l ON l.id = s.lesson_id
        WHERE s.user_id = $1 AND s.is_completed = true
        GROUP BY l.course_id
     ) comp ON comp.course_id = c.id
     WHERE e.student_id = $1
     ORDER BY e.enrolled_at DESC`,
    [studentId]
  );

  // 3. Get total study time
  const { rows: [timeRow] } = await db.query(
    `SELECT COALESCE(SUM(duration), 0)::int AS total_study_time_seconds
     FROM study_sessions
     WHERE user_id = $1`,
    [studentId]
  );

  // 4. Get recent quiz results
  const { rows: recentQuizzes } = await db.query(
    `SELECT
        qr.id AS result_id,
        qz.title AS quiz_title,
        qr.score,
        qr.difficulty_level,
        qr.time_taken,
        qr.taken_at
     FROM quiz_results qr
     JOIN quizzes qz ON qz.id = qr.quiz_id
     WHERE qr.user_id = $1
     ORDER BY qr.taken_at DESC
     LIMIT 5`,
    [studentId]
  );

  return {
    profile,
    courses,
    total_study_time_seconds: timeRow.total_study_time_seconds,
    recent_quizzes: recentQuizzes,
  };
};
