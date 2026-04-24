const db = require("../../db");

function assertUuid(id, name = "id") {
  // Lightweight UUID v4-ish check. DB will also validate.
  if (!id || typeof id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    throw { status: 400, message: `Invalid ${name}` };
  }
}

function assertOptionalString(value, fieldName) {
  if (value === undefined) return;
  if (value !== null && typeof value !== "string") {
    throw { status: 400, message: `${fieldName} must be a string` };
  }
}

function assertOptionalBoolean(value, fieldName) {
  if (value === undefined) return;
  if (typeof value !== "boolean") {
    throw { status: 400, message: `${fieldName} must be a boolean` };
  }
}

function assertTitle(title) {
  if (!title || typeof title !== "string")
    throw { status: 400, message: "title is required" };
  const t = title.trim();
  if (t.length < 3)
    throw { status: 400, message: "title must be at least 3 characters" };
  if (t.length > 255)
    throw { status: 400, message: "title must be at most 255 characters" };
  return t;
}

exports.listCourses = async () => {
  const { rows } = await db.query(
    `SELECT id, title, description, teacher_id, subject, is_published, created_at
     FROM courses
     ORDER BY created_at DESC`,
  );
  return rows;
};

exports.getCourseById = async (courseId) => {
  assertUuid(courseId, "course id");
  const { rows } = await db.query(
    `SELECT id, title, description, teacher_id, subject, is_published, created_at
     FROM courses
     WHERE id = $1`,
    [courseId],
  );
  if (!rows[0]) throw { status: 404, message: "Course not found" };
  return rows[0];
};

exports.createCourse = async ({
  teacherId,
  title,
  description = null,
  subject = null,
  isPublished = false,
}) => {
  assertUuid(teacherId, "teacher id");

  const normalizedTitle = assertTitle(title);
  assertOptionalString(description, "description");
  assertOptionalString(subject, "subject");
  // Controller passes boolean-ish; accept only boolean here.
  if (isPublished !== undefined && typeof isPublished !== "boolean") {
    throw { status: 400, message: "is_published must be a boolean" };
  }

  const { rows } = await db.query(
    `INSERT INTO courses (title, description, teacher_id, subject, is_published)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, description, teacher_id, subject, is_published, created_at`,
    [normalizedTitle, description, teacherId, subject, !!isPublished],
  );
  return rows[0];
};

exports.updateCourse = async (
  courseId,
  { teacherId, title, description, subject, isPublished },
) => {
  assertUuid(courseId, "course id");
  assertUuid(teacherId, "teacher id");

  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim().length < 3)
  ) {
    throw { status: 400, message: "title must be a string (min 3 characters)" };
  }
  assertOptionalString(description, "description");
  assertOptionalString(subject, "subject");
  assertOptionalBoolean(isPublished, "is_published");

  // Ownership
  const { rows: owned } = await db.query(
    "SELECT teacher_id FROM courses WHERE id = $1",
    [courseId],
  );
  if (!owned[0]) throw { status: 404, message: "Course not found" };
  if (owned[0].teacher_id !== teacherId)
    throw { status: 403, message: "Forbidden" };

  const { rows } = await db.query(
    `UPDATE courses
     SET title = COALESCE($2, title),
         description = COALESCE($3, description),
         subject = COALESCE($4, subject),
         is_published = COALESCE($5, is_published)
     WHERE id = $1
     RETURNING id, title, description, teacher_id, subject, is_published, created_at`,
    [
      courseId,
      typeof title === "string" ? title.trim() : null,
      description === undefined ? null : description,
      subject === undefined ? null : subject,
      isPublished === undefined ? null : !!isPublished,
    ],
  );
  return rows[0];
};

exports.deleteCourse = async (courseId, teacherId) => {
  assertUuid(courseId, "course id");
  assertUuid(teacherId, "teacher id");

  const { rows: owned } = await db.query(
    "SELECT teacher_id FROM courses WHERE id = $1",
    [courseId],
  );
  if (!owned[0]) throw { status: 404, message: "Course not found" };
  if (owned[0].teacher_id !== teacherId)
    throw { status: 403, message: "Forbidden" };

  await db.query("DELETE FROM courses WHERE id = $1", [courseId]);
};

exports.enrollStudent = async ({ courseId, studentId }) => {
  assertUuid(courseId, "course id");
  assertUuid(studentId, "student id");

  // Ensure course exists
  const { rows: c } = await db.query("SELECT id FROM courses WHERE id = $1", [
    courseId,
  ]);
  if (!c[0]) throw { status: 404, message: "Course not found" };

  const { rows } = await db.query(
    `INSERT INTO enrollments (student_id, course_id)
     VALUES ($1, $2)
     ON CONFLICT (student_id, course_id) DO NOTHING
     RETURNING id, student_id, course_id, enrolled_at`,
    [studentId, courseId],
  );

  // If existed already, return a stable response
  if (!rows[0]) {
    const { rows: existing } = await db.query(
      `SELECT id, student_id, course_id, enrolled_at
       FROM enrollments
       WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId],
    );
    return { ...existing[0], alreadyEnrolled: true };
  }

  return { ...rows[0], alreadyEnrolled: false };
};

exports.listLessonsByCourse = async (courseId) => {
  assertUuid(courseId, "course id");
  const { rows } = await db.query(
    `SELECT id, course_id, title, content, topic, difficulty_level, "order", is_published, created_at
     FROM lessons
     WHERE course_id = $1
     ORDER BY "order" ASC, created_at ASC`,
    [courseId],
  );
  return rows;
};

exports.listEnrolledCourses = async (studentId) => {
  assertUuid(studentId, "student id");
  const { rows } = await db.query(
    `SELECT c.id, c.title, c.description, c.teacher_id, c.subject, c.is_published, c.created_at, e.enrolled_at
     FROM courses c
     JOIN enrollments e ON c.id = e.course_id
     WHERE e.student_id = $1
     ORDER BY e.enrolled_at DESC`,
    [studentId]
  );
  return rows;
};
