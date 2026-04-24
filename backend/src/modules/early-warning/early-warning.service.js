const db = require('../../db');
const logger = require('../../utils/logger');

class EarlyWarningService {
    // Kiểm tra điểm số sau mỗi lần nộp bài Quiz.
    async evaluateQuizPerformance(userId, courseId, topic) {
        try {
            // Lấy 3 bài quiz gần nhất của user trong topic này
            const { rows: recentQuizzes } = await db.query(
                `SELECT qr.score 
                 FROM quiz_results qr
                 JOIN quizzes q ON qr.quiz_id = q.id
                 JOIN questions qs ON q.id = qs.quiz_id
                 WHERE qr.user_id = $1 AND qs.topic = $2
                 GROUP BY qr.id, qr.score, qr.taken_at
                 ORDER BY qr.taken_at DESC
                 LIMIT 3`,
                [userId, topic]
            );

            if (recentQuizzes.length === 0) return;

            // Bật cờ: Nếu có đủ 3 bài và tất cả đều < 40%
            if (recentQuizzes.length === 3) {
                const isConsecutivelyLow = recentQuizzes.every(q => parseFloat(q.score) < 40.0);
                if (isConsecutivelyLow) {
                    await db.query(
                        `INSERT INTO at_risk_flags (student_id, course_id, indicator_type, detail)
                         VALUES ($1, $2, 'low_score_consecutive', $3)
                         ON CONFLICT (student_id, course_id, indicator_type, resolved_at) DO NOTHING`,
                        [userId, courseId, `Scored below 40% in three consecutive quizzes (Topic: ${topic})`]
                    );
                    logger.info(`Activated 'low_score_consecutive' flag for user: ${userId}`);
                    return; 
                }
            }

            // Gỡ cờ: Điểm > 60% trong 2 phiên liên tiếp VÀ có ít nhất 3 phiên học trong 7 ngày
            if (recentQuizzes.length >= 2) {
                const firstTwo = recentQuizzes.slice(0, 2);
                const isConsistentlyGood = firstTwo.every(q => parseFloat(q.score) > 60.0);

                if (isConsistentlyGood) {
                    // Kiểm tra xem 7 ngày qua có học ít nhất 3 lần không
                    const { rows: sessionCount } = await db.query(
                        `SELECT COUNT(*) FROM study_sessions 
                         WHERE user_id = $1 AND started_at >= NOW() - INTERVAL '7 days'`,
                        [userId]
                    );

                    if (parseInt(sessionCount[0].count) >= 3) {
                        await db.query(
                            `UPDATE at_risk_flags 
                             SET resolved_at = NOW() 
                             WHERE student_id = $1 AND indicator_type = 'low_score_consecutive' AND resolved_at IS NULL`,
                            [userId]
                        );
                        logger.info(`Resolved warning flag for user: ${userId}`);
                    }
                }
            }
        } catch (error) {
            logger.error(`Error in evaluateQuizPerformance: ${error.message}`, { stack: error.stack });
        }
    }

    // Quét "Không hoạt động kéo dài"
    async scanInactivity() {
        try {
            const { rowCount } = await db.query(
                `INSERT INTO at_risk_flags (student_id, course_id, indicator_type, detail)
                 SELECT e.student_id, e.course_id, 'long_inactivity', 'Không có hoạt động học tập nào trong 7 ngày qua'
                 FROM learning_profiles lp
                 JOIN enrollments e ON lp.user_id = e.student_id
                 WHERE (CURRENT_DATE - lp.last_active_date) >= 7
                 AND NOT EXISTS (
                     SELECT 1 FROM at_risk_flags arf 
                     WHERE arf.student_id = e.student_id 
                     AND arf.course_id = e.course_id
                     AND arf.indicator_type = 'long_inactivity' 
                     AND arf.resolved_at IS NULL
                 )`
            );
            
            await db.query(
                `UPDATE at_risk_flags arf
                 SET resolved_at = NOW()
                 FROM learning_profiles lp
                 WHERE arf.student_id = lp.user_id 
                 AND arf.indicator_type = 'long_inactivity' 
                 AND arf.resolved_at IS NULL
                 AND (CURRENT_DATE - lp.last_active_date) < 7`
            );

            if (rowCount > 0) logger.info(`Cron Inactivity Scan: Flagged ${rowCount} new students.`);
        } catch (error) {
            logger.error(`Error in scanInactivity: ${error.message}`, { stack: error.stack });
        }
    }

    // Quét "Tiến độ đình trệ"
    async scanStagnantProgress() {
        try {
            // Tìm học sinh không hoàn thành bất kỳ bài học nào (is_completed = true) trong 7 ngày qua
            const { rowCount } = await db.query(
                `INSERT INTO at_risk_flags (student_id, course_id, indicator_type, detail)
                 SELECT e.student_id, e.course_id, 'stagnant_progress', 'Không hoàn thành thêm bài học nào so với tuần trước'
                 FROM enrollments e
                 WHERE NOT EXISTS (
                     SELECT 1 FROM study_sessions ss 
                     JOIN lessons l ON ss.lesson_id = l.id
                     WHERE ss.user_id = e.student_id 
                     AND l.course_id = e.course_id
                     AND ss.is_completed = true 
                     AND ss.completed_at >= NOW() - INTERVAL '7 days'
                 )
                 AND NOT EXISTS (
                     SELECT 1 FROM at_risk_flags arf 
                     WHERE arf.student_id = e.student_id 
                     AND arf.course_id = e.course_id
                     AND arf.indicator_type = 'stagnant_progress' 
                     AND arf.resolved_at IS NULL
                 )`
            );

            // Gỡ cờ nếu học sinh vừa hoàn thành một bài học trong 7 ngày qua
            await db.query(
                `UPDATE at_risk_flags arf
                 SET resolved_at = NOW()
                 WHERE arf.indicator_type = 'stagnant_progress' 
                 AND arf.resolved_at IS NULL
                 AND EXISTS (
                     SELECT 1 FROM study_sessions ss 
                     WHERE ss.user_id = arf.student_id 
                     AND ss.is_completed = true 
                     AND ss.completed_at >= NOW() - INTERVAL '7 days'
                 )`
            );

            if (rowCount > 0) logger.info(`Cron Stagnant Scan: Flagged ${rowCount} new students.`);
        } catch (error) {
            logger.error(`Error in scanStagnantProgress: ${error.message}`, { stack: error.stack });
        }
    }
}

module.exports = new EarlyWarningService();
