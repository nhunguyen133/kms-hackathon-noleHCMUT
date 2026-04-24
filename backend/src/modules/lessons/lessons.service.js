const db = require("../../db");

const ALLOWED_DIFFICULTY = new Set(["easy", "medium", "hard"]);

function assertUuid(id, name = "id") {
  if (!id || typeof id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    throw { status: 400, message: `Invalid ${name}` };
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

function assertDifficulty(value) {
  if (value === undefined || value === null) return;
  if (typeof value !== "string" || !ALLOWED_DIFFICULTY.has(value)) {
    throw {
      status: 400,
      message: "difficulty_level must be one of: easy, medium, hard",
    };
  }
}

function assertOptionalOrder(value) {
  if (value === undefined || value === null) return;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw { status: 400, message: "order must be a non-negative integer" };
  }
  return n;
}

async function assertCourseOwnedByTeacher(courseId, teacherId) {
  const { rows } = await db.query(
    "SELECT teacher_id FROM courses WHERE id = $1",
    [courseId],
  );
  if (!rows[0]) throw { status: 404, message: "Course not found" };
  if (rows[0].teacher_id !== teacherId)
    throw { status: 403, message: "Forbidden" };
}

exports.listLessons = async ({ courseId } = {}) => {
  if (courseId) assertUuid(courseId, "course id");

  const { rows } = await db.query(
    `SELECT id, course_id, title, content, topic, difficulty_level, "order", is_published, created_at
     FROM lessons
     WHERE ($1::uuid IS NULL OR course_id = $1)
     ORDER BY course_id ASC, "order" ASC, created_at ASC`,
    [courseId || null],
  );
  return rows;
};

exports.getLessonById = async (lessonId) => {
  assertUuid(lessonId, "lesson id");
  const { rows } = await db.query(
    `SELECT id, course_id, title, content, topic, difficulty_level, "order", is_published, created_at
     FROM lessons
     WHERE id = $1`,
    [lessonId],
  );
  if (!rows[0]) throw { status: 404, message: "Lesson not found" };
  return rows[0];
};

exports.createLesson = async ({
  teacherId,
  courseId,
  title,
  content = null,
  topic = null,
  difficultyLevel = "medium",
  order = 0,
  isPublished = false,
}) => {
  assertUuid(teacherId, "teacher id");
  assertUuid(courseId, "course id");

  const normalizedTitle = assertTitle(title);
  assertOptionalString(content, "content");
  assertOptionalString(topic, "topic");
  assertDifficulty(difficultyLevel);
  const normalizedOrder = assertOptionalOrder(order) ?? 0;
  if (isPublished !== undefined && typeof isPublished !== "boolean") {
    throw { status: 400, message: "is_published must be a boolean" };
  }

  await assertCourseOwnedByTeacher(courseId, teacherId);

  const { rows } = await db.query(
    `INSERT INTO lessons (course_id, title, content, topic, difficulty_level, "order", is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, course_id, title, content, topic, difficulty_level, "order", is_published, created_at`,
    [
      courseId,
      normalizedTitle,
      content,
      topic,
      difficultyLevel,
      normalizedOrder,
      !!isPublished,
    ],
  );
  return rows[0];
};

exports.updateLesson = async (
  lessonId,
  { teacherId, title, content, topic, difficultyLevel, order, isPublished },
) => {
  assertUuid(lessonId, "lesson id");
  assertUuid(teacherId, "teacher id");

  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim().length < 3)
  ) {
    throw { status: 400, message: "title must be a string (min 3 characters)" };
  }
  assertOptionalString(content, "content");
  assertOptionalString(topic, "topic");
  assertDifficulty(difficultyLevel);
  const normalizedOrder = assertOptionalOrder(order);
  assertOptionalBoolean(isPublished, "is_published");

  const { rows: existing } = await db.query(
    "SELECT course_id FROM lessons WHERE id = $1",
    [lessonId],
  );
  if (!existing[0]) throw { status: 404, message: "Lesson not found" };

  await assertCourseOwnedByTeacher(existing[0].course_id, teacherId);

  const { rows } = await db.query(
    `UPDATE lessons
     SET title = COALESCE($2, title),
         content = COALESCE($3, content),
         topic = COALESCE($4, topic),
         difficulty_level = COALESCE($5, difficulty_level),
         "order" = COALESCE($6, "order"),
         is_published = COALESCE($7, is_published)
     WHERE id = $1
     RETURNING id, course_id, title, content, topic, difficulty_level, "order", is_published, created_at`,
    [
      lessonId,
      typeof title === "string" ? title.trim() : null,
      content === undefined ? null : content,
      topic === undefined ? null : topic,
      difficultyLevel === undefined ? null : difficultyLevel,
      normalizedOrder === undefined ? null : normalizedOrder,
      isPublished === undefined ? null : !!isPublished,
    ],
  );

  return rows[0];
};

exports.deleteLesson = async (lessonId, teacherId) => {
  assertUuid(lessonId, "lesson id");
  assertUuid(teacherId, "teacher id");

  const { rows: existing } = await db.query(
    "SELECT course_id FROM lessons WHERE id = $1",
    [lessonId],
  );
  if (!existing[0]) throw { status: 404, message: "Lesson not found" };

  await assertCourseOwnedByTeacher(existing[0].course_id, teacherId);
  await db.query("DELETE FROM lessons WHERE id = $1", [lessonId]);
};
