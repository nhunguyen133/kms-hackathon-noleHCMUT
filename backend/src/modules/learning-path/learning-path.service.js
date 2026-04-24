const db = require('../../db');

/**
 * Get the currently stored recommended path for a user in a specific course
 */
exports.getRecommendedPath = async (userId, courseId) => {
  const { rows } = await db.query(
    'SELECT recommended_path FROM learning_roadmaps WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );
  return rows[0]?.recommended_path || [];
};

/**
 * Recalculate the learning roadmap based on student performance (weak topics)
 */
exports.recalculate = async (userId, courseId) => {
  // 1. Get student's weak topics from their learning profile
  const { rows: [profile] } = await db.query(
    'SELECT weak_topics FROM learning_profiles WHERE user_id = $1', [userId]
  );
  const weakTopics = profile?.weak_topics || [];

  // 2. Get all published lessons in the course
  const { rows: lessons } = await db.query(
    'SELECT id, title, topic, "order" FROM lessons WHERE course_id = $1 AND is_published = true ORDER BY "order"',
    [courseId]
  );

  // 3. Get already completed lessons
  const { rows: completed } = await db.query(
    'SELECT lesson_id FROM study_sessions WHERE user_id = $1 AND is_completed = true',
    [userId]
  );
  const completedIds = new Set(completed.map(r => r.lesson_id));

  // 4. Calculate the path:
  // - Filter out completed lessons
  // - Prioritize lessons whose topic is in the student's weak_topics
  const path = lessons
    .filter(l => !completedIds.has(l.id))
    .sort((a, b) => {
      const aIsWeak = weakTopics.includes(a.topic) ? 1 : 0;
      const bIsWeak = weakTopics.includes(b.topic) ? 1 : 0;
      
      if (aIsWeak !== bIsWeak) {
        // Higher priority for weak topics (b - a to put 1 before 0)
        return bIsWeak - aIsWeak;
      }
      // If both are equally important (both weak or both not weak), follow standard course order
      return a.order - b.order;
    })
    .map((l, index) => ({
      step: index + 1,
      lesson_id: l.id,
      title: l.title,
      topic: l.topic,
      status: index === 0 ? 'current' : 'upcoming'
    }));

  // 5. Store the new roadmap in the database
  await db.query(
    `INSERT INTO learning_roadmaps (user_id, course_id, recommended_path, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, course_id) DO UPDATE
     SET recommended_path = $3, updated_at = NOW()`,
    [userId, courseId, JSON.stringify(path)]
  );

  return path;
};
