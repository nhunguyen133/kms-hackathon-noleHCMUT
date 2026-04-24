const db = require("../../db");

function assertUuid(id, name = "id") {
  if (!id || typeof id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    throw { status: 400, message: `Invalid ${name}` };
  }
}

async function assertInstructorOwnsCourse({ instructorId, courseId }) {
  const { rows } = await db.query(
    `SELECT id, title
     FROM courses
     WHERE id = $1 AND teacher_id = $2`,
    [courseId, instructorId],
  );
  if (!rows[0]) throw { status: 404, message: "Course not found" };
  return rows[0];
}

/**
 * Overview aggregates across all courses owned by instructor.
 */
exports.getOverview = async (instructorId) => {
  assertUuid(instructorId, "instructor id");

  // Per-course overview. Works even if a course has 0 enrollments.
  const { rows: courses } = await db.query(
    `SELECT
        c.id AS course_id,
        c.title,
        COALESCE(enr.students, 0)::int AS students,
        COALESCE(les.lessons, 0)::int AS lessons,
        COALESCE(qs.avg_score_30d, NULL) AS avg_score_30d,
        COALESCE(ss.sessions_7d, 0)::int AS sessions_7d,
        COALESCE(ar.at_risk_active, 0)::int AS at_risk_active
     FROM courses c
     LEFT JOIN (
       SELECT course_id, COUNT(DISTINCT student_id) AS students
       FROM enrollments
       GROUP BY course_id
     ) enr ON enr.course_id = c.id
     LEFT JOIN (
       SELECT course_id, COUNT(*) AS lessons
       FROM lessons
       GROUP BY course_id
     ) les ON les.course_id = c.id
     LEFT JOIN (
       SELECT l.course_id, ROUND(AVG(qr.score)::numeric, 2) AS avg_score_30d
       FROM quiz_results qr
       JOIN quizzes qz ON qz.id = qr.quiz_id
       JOIN lessons l ON l.id = qz.lesson_id
       WHERE qr.taken_at >= NOW() - INTERVAL '30 days'
       GROUP BY l.course_id
     ) qs ON qs.course_id = c.id
     LEFT JOIN (
       SELECT l.course_id, COUNT(*) AS sessions_7d
       FROM study_sessions s
       JOIN lessons l ON l.id = s.lesson_id
       WHERE s.started_at >= NOW() - INTERVAL '7 days'
       GROUP BY l.course_id
     ) ss ON ss.course_id = c.id
     LEFT JOIN (
       SELECT course_id, COUNT(*) AS at_risk_active
       FROM at_risk_flags
       WHERE resolved_at IS NULL
       GROUP BY course_id
     ) ar ON ar.course_id = c.id
     WHERE c.teacher_id = $1
     ORDER BY c.created_at DESC`,
    [instructorId],
  );

  // Distinct student count across all courses owned by this instructor.
  const {
    rows: [distinctStudentsRow],
  } = await db.query(
    `SELECT COUNT(DISTINCT e.student_id)::int AS total_students
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     WHERE c.teacher_id = $1`,
    [instructorId],
  );

  // Global summary for convenience (optional)
  const totalCourses = courses.length;

  return {
    summary: {
      total_courses: totalCourses,
  total_students: distinctStudentsRow?.total_students ?? 0,
    },
    courses,
  };
};

/**
 * Students list across ALL instructor courses.
 * Optional filters: courseId
 */
exports.getStudents = async (instructorId, { courseId } = {}) => {
  assertUuid(instructorId, "instructor id");
  if (courseId !== undefined) assertUuid(courseId, "course id");

  if (courseId) {
    await assertInstructorOwnsCourse({ instructorId, courseId });
  }

  const params = [instructorId];
  let courseFilterSql = "";
  if (courseId) {
    params.push(courseId);
    courseFilterSql = "AND c.id = $2";
  }

  const { rows } = await db.query(
    `SELECT
        u.id AS student_id,
        u.name,
        u.email,
        lp.last_active_date,
        lp.streak_count,
        e.course_id,
        c.title AS course_title,
        COALESCE(ss.sessions_7d, 0)::int AS sessions_7d,
        COALESCE(qs.avg_score_30d, NULL) AS avg_score_30d,
        COALESCE(ar.flags, '[]'::jsonb) AS at_risk_active
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id AND c.teacher_id = $1 ${courseFilterSql}
     JOIN users u ON u.id = e.student_id
     LEFT JOIN learning_profiles lp ON lp.user_id = u.id
     LEFT JOIN (
       SELECT s.user_id, l.course_id, COUNT(*) AS sessions_7d
       FROM study_sessions s
       JOIN lessons l ON l.id = s.lesson_id
       WHERE s.started_at >= NOW() - INTERVAL '7 days'
       GROUP BY s.user_id, l.course_id
     ) ss ON ss.user_id = u.id AND ss.course_id = c.id
     LEFT JOIN (
       SELECT qr.user_id, l.course_id, ROUND(AVG(qr.score)::numeric, 2) AS avg_score_30d
       FROM quiz_results qr
       JOIN quizzes qz ON qz.id = qr.quiz_id
       JOIN lessons l ON l.id = qz.lesson_id
       WHERE qr.taken_at >= NOW() - INTERVAL '30 days'
       GROUP BY qr.user_id, l.course_id
     ) qs ON qs.user_id = u.id AND qs.course_id = c.id
     LEFT JOIN (
       SELECT
         student_id,
         course_id,
         jsonb_agg(
           jsonb_build_object(
             'id', id,
             'indicator_type', indicator_type,
             'detail', detail,
             'triggered_at', triggered_at
           ) ORDER BY triggered_at DESC
         ) AS flags
       FROM at_risk_flags
       WHERE resolved_at IS NULL
       GROUP BY student_id, course_id
     ) ar ON ar.student_id = u.id AND ar.course_id = c.id
     ORDER BY COALESCE(lp.last_active_date, '1970-01-01'::date) DESC, u.created_at DESC`,
    params,
  );

  return rows;
};

/**
 * Student detail for instructor: student info + courses under this instructor + active flags.
 */
exports.getStudentDetail = async (instructorId, studentId) => {
  assertUuid(instructorId, "instructor id");
  assertUuid(studentId, "student id");

  // Ensure this student is enrolled in at least one course owned by instructor.
  const { rows: studentRows } = await db.query(
    `SELECT u.id, u.name, u.email, u.role,
            lp.last_active_date, lp.streak_count, lp.weekly_study_goal, lp.weak_topics
     FROM users u
     LEFT JOIN learning_profiles lp ON lp.user_id = u.id
     WHERE u.id = $1`,
    [studentId],
  );
  const student = studentRows[0];
  if (!student) throw { status: 404, message: "Student not found" };

  const { rows: instructorCourses } = await db.query(
    `SELECT c.id AS course_id, c.title
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = $1 AND c.teacher_id = $2
     ORDER BY c.created_at DESC`,
    [studentId, instructorId],
  );

  if (instructorCourses.length === 0) {
    throw { status: 403, message: "Forbidden" };
  }

  const { rows: atRisk } = await db.query(
    `SELECT id, course_id, indicator_type, detail, triggered_at
     FROM at_risk_flags
     WHERE student_id = $1 AND resolved_at IS NULL
     ORDER BY triggered_at DESC`,
    [studentId],
  );

  return {
    student,
    courses: instructorCourses,
    at_risk_active: atRisk,
  };
};

/**
 * At-risk flags across all instructor courses.
 */
exports.getAtRisk = async (instructorId, { courseId } = {}) => {
  assertUuid(instructorId, "instructor id");
  if (courseId !== undefined) assertUuid(courseId, "course id");

  if (courseId) {
    await assertInstructorOwnsCourse({ instructorId, courseId });
  }

  const params = [instructorId];
  let courseFilterSql = "";
  if (courseId) {
    params.push(courseId);
    courseFilterSql = "AND c.id = $2";
  }

  const { rows } = await db.query(
    `SELECT
        f.id,
        f.course_id,
        c.title AS course_title,
        f.student_id,
        u.name AS student_name,
        u.email AS student_email,
        f.indicator_type,
        f.detail,
        f.triggered_at
     FROM at_risk_flags f
     JOIN courses c ON c.id = f.course_id AND c.teacher_id = $1 ${courseFilterSql}
     JOIN users u ON u.id = f.student_id
     WHERE f.resolved_at IS NULL
     ORDER BY f.triggered_at DESC`,
    params,
  );

  return rows;
};
