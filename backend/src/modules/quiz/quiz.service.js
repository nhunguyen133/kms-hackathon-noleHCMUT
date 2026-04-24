const db = require('../../db');

const DIFFICULTY_SCALE = ['easy', 'medium', 'hard'];

/**
 * Start a new adaptive quiz session for a lesson
 */
exports.startSession = async (userId, lessonId) => {
  // Get difficulty from the user's most recent quiz result, default to 'medium'
  const { rows } = await db.query(
    `SELECT difficulty_level FROM quiz_results 
     WHERE user_id = $1 ORDER BY taken_at DESC LIMIT 1`, [userId]
  );
  const startDifficulty = rows[0]?.difficulty_level ?? 'medium';

  // Get the first question
  const firstQuestion = await getNextQuestion(lessonId, startDifficulty, []);
  
  if (!firstQuestion) {
    throw new Error("No questions available for this lesson.");
  }

  return { 
    question: {
      id: firstQuestion.id,
      content: firstQuestion.content,
      options: firstQuestion.options,
      topic: firstQuestion.topic,
      difficulty_level: firstQuestion.difficulty_level
    }, 
    sessionState: {
      currentDifficulty: startDifficulty,
      answers: [],
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0
    }
  };
};

/**
 * Process a quiz answer and determine the next question or end the session
 */
exports.processAnswer = async (userId, { questionId, answer, lessonId, sessionState }) => {
  // 1. Check if the answer is correct
  const { rows: [q] } = await db.query('SELECT * FROM questions WHERE id = $1', [questionId]);
  if (!q) throw new Error("Question not found.");
  
  const isCorrect = q.correct_answer === answer;

  // 2. Adaptive Algorithm: Adjust difficulty
  const currentIdx = DIFFICULTY_SCALE.indexOf(sessionState.currentDifficulty);
  let nextDifficulty = sessionState.currentDifficulty;

  if (isCorrect) {
    // Correct -> Increase difficulty if not yet at 'hard'
    nextDifficulty = DIFFICULTY_SCALE[Math.min(currentIdx + 1, 2)];
  } else {
    // Incorrect -> Decrease difficulty if not yet at 'easy'
    nextDifficulty = DIFFICULTY_SCALE[Math.max(currentIdx - 1, 0)];
  }

  // 3. Update Session State
  const updatedState = {
    ...sessionState,
    answers: [...sessionState.answers, { questionId, isCorrect, topic: q.topic }],
    currentDifficulty: nextDifficulty,
    consecutiveCorrect: isCorrect ? sessionState.consecutiveCorrect + 1 : 0,
    consecutiveIncorrect: !isCorrect ? sessionState.consecutiveIncorrect + 1 : 0
  };

  // 4. Check ending conditions
  // - 10 questions total
  // - 3 consecutive correct at 'hard' level
  // - 3 consecutive incorrect at 'easy' level
  const shouldEnd = updatedState.answers.length >= 10 || 
                    (updatedState.consecutiveCorrect >= 3 && nextDifficulty === 'hard') ||
                    (updatedState.consecutiveIncorrect >= 3 && nextDifficulty === 'easy');

  if (shouldEnd) {
    const summary = await finishSession(userId, lessonId, updatedState);
    return { done: true, isCorrect, correctAnswer: q.correct_answer, summary };
  }

  // 5. Get next question based on new difficulty
  const excludeIds = updatedState.answers.map(a => a.questionId);
  const nextQuestion = await getNextQuestion(lessonId, nextDifficulty, excludeIds);

  // If no more questions at this difficulty, try other difficulties
  let finalNextQuestion = nextQuestion;
  if (!finalNextQuestion) {
    for (const diff of DIFFICULTY_SCALE) {
      if (diff === nextDifficulty) continue;
      finalNextQuestion = await getNextQuestion(lessonId, diff, excludeIds);
      if (finalNextQuestion) {
        updatedState.currentDifficulty = diff;
        break;
      }
    }
  }

  if (!finalNextQuestion) {
    // Truly no more questions left
    const summary = await finishSession(userId, lessonId, updatedState);
    return { done: true, isCorrect, correctAnswer: q.correct_answer, summary };
  }

  return { 
    done: false, 
    isCorrect, 
    correctAnswer: isCorrect ? null : q.correct_answer,
    nextQuestion: {
      id: finalNextQuestion.id,
      content: finalNextQuestion.content,
      options: finalNextQuestion.options,
      topic: finalNextQuestion.topic,
      difficulty_level: finalNextQuestion.difficulty_level
    }, 
    updatedState 
  };
};

/**
 * Helper to get a random question by difficulty, excluding already answered ones
 */
async function getNextQuestion(lessonId, difficulty, excludeIds) {
  const { rows } = await db.query(
    `SELECT q.* FROM questions q
     JOIN quizzes qz ON qz.id = q.quiz_id
     WHERE qz.lesson_id = $1
     AND q.difficulty_level = $2
     AND q.id != ALL($3::uuid[])
     ORDER BY RANDOM() LIMIT 1`,
    [lessonId, difficulty, excludeIds.length > 0 ? excludeIds : [null]]
  );
  return rows[0];
}

/**
 * Finalize the quiz session, calculate score and update learning profile
 */
async function finishSession(userId, lessonId, state) {
  const totalQuestions = state.answers.length;
  const correctCount = state.answers.filter(a => a.isCorrect).length;
  const score = (correctCount / totalQuestions) * 100;

  // Identify weak topics (more than 50% incorrect)
  const topicStats = {};
  state.answers.forEach(a => {
    if (!topicStats[a.topic]) topicStats[a.topic] = { correct: 0, total: 0 };
    topicStats[a.topic].total++;
    if (a.isCorrect) topicStats[a.topic].correct++;
  });

  const weakTopics = Object.keys(topicStats).filter(topic => {
    const stats = topicStats[topic];
    return (stats.correct / stats.total) < 0.5;
  });

  // Save result to database
  const { rows: [quizIdRow] } = await db.query(
    `SELECT id FROM quizzes WHERE lesson_id = $1 LIMIT 1`, [lessonId]
  );
  
  if (quizIdRow) {
    await db.query(
      `INSERT INTO quiz_results (user_id, quiz_id, score, difficulty_level, answers)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, quizIdRow.id, score, state.currentDifficulty, JSON.stringify(state.answers)]
    );
  }

  // Update learning profile with weak topics
  if (weakTopics.length > 0) {
    await db.query(
      `UPDATE learning_profiles 
       SET weak_topics = (
         SELECT jsonb_agg(DISTINCT x)
         FROM jsonb_array_elements(weak_topics || $1::jsonb) AS x
       ), updated_at = NOW()
       WHERE user_id = $2`,
      [JSON.stringify(weakTopics), userId]
    );
  }

  return { score, correctCount, totalQuestions, weakTopics };
}
