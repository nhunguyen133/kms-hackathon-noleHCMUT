/*
  Seed data (Neon Postgres) - REWRITTEN FOR TESTING

  Contract:
  - Idempotent: Clears all data first using TRUNCATE CASCADE.
  - Uses simple string IDs for easy Postman testing.
*/

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const bcrypt = require("bcryptjs");
const { pool } = require("./index");

const UUID_INSTRUCTOR = "1";
const UUID_STUDENTS = ["2", "3", "4", "5", "6"];
const UUID_COURSES = ["10", "11", "12"];

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in environment (.env)");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("1. Cleaning up old data...");
    await client.query("TRUNCATE TABLE at_risk_flags CASCADE");
    await client.query("TRUNCATE TABLE ai_interactions CASCADE");
    await client.query("TRUNCATE TABLE study_sessions CASCADE");
    await client.query("TRUNCATE TABLE quiz_results CASCADE");
    await client.query("TRUNCATE TABLE questions CASCADE");
    await client.query("TRUNCATE TABLE quizzes CASCADE");
    await client.query("TRUNCATE TABLE learning_roadmaps CASCADE");
    await client.query("TRUNCATE TABLE learning_profiles CASCADE");
    await client.query("TRUNCATE TABLE enrollments CASCADE");
    await client.query("TRUNCATE TABLE lessons CASCADE");
    await client.query("TRUNCATE TABLE courses CASCADE");
    await client.query("TRUNCATE TABLE users CASCADE");

    console.log("2. Creating Users...");
    const plainPassword = "123456";
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const instructorEmail = "linh.teacher@gmail.com";
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'instructor')`,
      [UUID_INSTRUCTOR, "Linh Teacher", instructorEmail, passwordHash]
    );

    const studentData = [
      { id: UUID_STUDENTS[0], name: "Student 1 (Perfect)", email: "student.one@gmail.com", streak: 10, time: 36000 },
      { id: UUID_STUDENTS[1], name: "Student 2 (Struggling)", email: "an.student1@gmail.com", streak: 1, time: 2000 },
      { id: UUID_STUDENTS[2], name: "Student 3 (Inactive)", email: "binh.student2@gmail.com", streak: 0, time: 0 },
      { id: UUID_STUDENTS[3], name: "Student 4 (Average)", email: "chi.student3@gmail.com", streak: 3, time: 15000 },
      { id: UUID_STUDENTS[4], name: "Student 5 (New)", email: "dung.student4@gmail.com", streak: 0, time: 0 },
    ];

    for (const s of studentData) {
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, 'student')`,
        [s.id, s.name, s.email, passwordHash]
      );

      await client.query(
        `INSERT INTO learning_profiles (user_id, onboarding_completed, weekly_study_goal, streak_count, last_active_date, weak_topics)
         VALUES ($1, true, 5, $2, CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 5)::int, '["logic", "fallacies"]'::jsonb)`,
        [s.id, s.streak]
      );
    }

    console.log("3. Creating Courses...");
    const courseTitles = ["Critical Thinking Basics", "Advanced Problem Solving", "Draft Course (Not published)"];
    
    for (let i = 0; i < courseTitles.length; i++) {
      await client.query(
        `INSERT INTO courses (id, title, description, teacher_id, subject, is_published)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [UUID_COURSES[i], courseTitles[i], `Description for ${courseTitles[i]}`, UUID_INSTRUCTOR, "critical-thinking", i < 2]
      );
    }

    console.log("4. Creating Lessons & Quizzes & Enrollments...");
    const topics = ["logic", "critical-thinking", "fallacies", "probability", "problem-solving"];
    
    for (const s of studentData) {
      for (let c = 0; c < 2; c++) {
        await client.query(
          `INSERT INTO enrollments (id, student_id, course_id) VALUES ($1, $2, $3)`,
          [`enr_${s.id}_${c}`, s.id, UUID_COURSES[c]]
        );
      }
    }

    let lessonCounter = 100;
    let quizCounter = 1000;
    let questionCounter = 10000;
    let sessionCounter = 1;
    let resultCounter = 1;

    for (let c = 0; c < 2; c++) { 
      const courseId = UUID_COURSES[c];
      
      for (let i = 0; i < 5; i++) {
        const topic = topics[i % topics.length];
        const lessonIdStr = String(lessonCounter);
        
        await client.query(
          `INSERT INTO lessons (id, course_id, title, content, topic, difficulty_level, "order", is_published)
           VALUES ($1, $2, $3, $4, $5, 'medium', $6, true)`,
          [lessonIdStr, courseId, `Lesson ${i + 1}: ${topic}`, `Detailed content for ${topic}.`, topic, i + 1]
        );

        const quizIdStr = String(quizCounter);
        await client.query(
          `INSERT INTO quizzes (id, lesson_id, title) VALUES ($1, $2, $3)`,
          [quizIdStr, lessonIdStr, `Quiz for Lesson ${lessonCounter}`]
        );

        const diffs = ["easy", "medium", "hard"];
        for (let d = 0; d < 3; d++) {
          const options = [
            { key: "A", text: "Answer A" },
            { key: "B", text: "Answer B" },
            { key: "C", text: "Answer C" },
            { key: "D", text: "Answer D" },
          ];
          await client.query(
            `INSERT INTO questions (id, quiz_id, content, options, correct_answer, topic, difficulty_level)
             VALUES ($1, $2, $3, $4::jsonb, 'A', $5, $6)`,
            [String(questionCounter++), quizIdStr, `Question for ${topic} (${diffs[d]})`, JSON.stringify(options), topic, diffs[d]]
          );
        }

        for (const s of studentData) {
          if (s.name.includes("Inactive")) continue;

          const duration = Math.floor(Math.random() * 1000) + 300;
          await client.query(
            `INSERT INTO study_sessions (id, user_id, lesson_id, duration, is_completed)
             VALUES ($1, $2, $3, $4, true)`,
            [String(sessionCounter++), s.id, lessonIdStr, duration]
          );

          let score = 0;
          if (s.name.includes("Perfect")) score = 100;
          else if (s.name.includes("Struggling")) score = Math.floor(Math.random() * 40) + 20; 
          else score = Math.floor(Math.random() * 40) + 60; 

          await client.query(
            `INSERT INTO quiz_results (id, user_id, quiz_id, score, difficulty_level, time_taken, answers)
             VALUES ($1, $2, $3, $4, 'medium', $5, '{}'::jsonb)`,
            [String(resultCounter++), s.id, quizIdStr, score, Math.floor(duration / 2)]
          );
        }

        lessonCounter++;
        quizCounter++;
      }
    }

    console.log("5. Creating At-Risk Flags...");
    await client.query(
      `INSERT INTO at_risk_flags (id, student_id, course_id, indicator_type, detail)
       VALUES ('risk_1', $1, $2, 'low_score_consecutive', 'Scored below 50% on 3 consecutive quizzes.')`,
      [UUID_STUDENTS[1], UUID_COURSES[0]]
    );

    await client.query(
      `INSERT INTO at_risk_flags (id, student_id, course_id, indicator_type, detail)
       VALUES ('risk_2', $1, $2, 'long_inactivity', 'Has not logged in for 14 days.')`,
      [UUID_STUDENTS[2], UUID_COURSES[0]]
    );

    console.log("6. Creating AI Interactions and Roadmaps...");
    // AI Interactions for Student 1
    const sessionId = "session_1";
    await client.query(
      `INSERT INTO ai_interactions (id, user_id, session_id, lesson_id, role, message_index, user_message, created_at)
       VALUES ('ai_1', $1, $2, '100', 'user', 0, 'Can you explain the Fallacy of Composition?', NOW() - INTERVAL '1 hour')`,
      [UUID_STUDENTS[0], sessionId]
    );
    await client.query(
      `INSERT INTO ai_interactions (id, user_id, session_id, lesson_id, role, message_index, ai_response, created_at)
       VALUES ('ai_2', $1, $2, '100', 'assistant', 1, 'Of course! The Fallacy of Composition arises when one infers that something is true of the whole from the fact that it is true of some part of the whole.', NOW() - INTERVAL '59 minutes')`,
      [UUID_STUDENTS[0], sessionId]
    );

    // Learning Roadmap for Student 1
    const roadmapPath = [
      { lesson_id: "100", status: "completed", recommended_next: "101" },
      { lesson_id: "101", status: "pending", focus_areas: ["logic"] }
    ];
    await client.query(
      `INSERT INTO learning_roadmaps (id, user_id, course_id, recommended_path)
       VALUES ('roadmap_1', $1, $2, $3::jsonb)`,
      [UUID_STUDENTS[0], UUID_COURSES[0], JSON.stringify(roadmapPath)]
    );

    await client.query("COMMIT");

    console.log("=== SEED RE-WRITTEN SUCCESSFULLY ===");
    console.log("AUTH PASSWORD:", plainPassword);
    console.log("INSTRUCTOR:", { id: UUID_INSTRUCTOR, email: instructorEmail });
    console.log("STUDENT 1 (Perfect):", { id: UUID_STUDENTS[0], email: studentData[0].email });
    console.log("STUDENT 2 (Struggling):", { id: UUID_STUDENTS[1], email: studentData[1].email });
    console.log("COURSE 1:", { id: UUID_COURSES[0], title: courseTitles[0] });
    console.log("COURSE 2:", { id: UUID_COURSES[1], title: courseTitles[1] });
    console.log("LESSON 1 (Course 1):", "100");
    console.log("QUIZ 1 (Lesson 1):", "1000");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed. Rolled back.", err);
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
