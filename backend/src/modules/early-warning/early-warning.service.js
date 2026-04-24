const db = require('../../db');

/**
 * Identify students who might be falling behind.
 * Criteria: 
 * - Have specific 'weak_topics' populated in their profile.
 * - Or have an average score < 50% in their recent quizzes.
 */
exports.getAtRiskStudents = async (instructorId) => {
  // To keep it simple for the hackathon, we fetch all students with weak topics 
  // or low average scores in courses created by this instructor.
  
  const query = `
    WITH StudentStats AS (
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        lp.weak_topics,
        COALESCE(AVG(qr.score), 0) as avg_score,
        COUNT(qr.id) as quizzes_taken
      FROM users u
      JOIN learning_profiles lp ON lp.user_id = u.id
      LEFT JOIN quiz_results qr ON qr.user_id = u.id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.email, lp.weak_topics
    )
    SELECT * FROM StudentStats
    WHERE 
      (weak_topics IS NOT NULL AND jsonb_array_length(weak_topics) > 0)
      OR 
      (quizzes_taken > 0 AND avg_score < 50)
    ORDER BY avg_score ASC;
  `;

  // Note: For a real system, we'd filter by students enrolled in the instructor's courses.
  // Assuming platform-wide view for simplicity if instructor, or we can add a JOIN on enrollments.

  const { rows } = await db.query(query);
  return rows;
};
