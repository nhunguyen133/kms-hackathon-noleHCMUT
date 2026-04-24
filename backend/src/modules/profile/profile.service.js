const db = require("../../db");

function assertUuid(id, name = "id") {
  if (!id) {
    throw { status: 400, message: `Invalid ${name}` };
  }
}

exports.getProfile = async (userId) => {
  assertUuid(userId, "user id");

  const { rows: userRows } = await db.query(
    `SELECT id, name, email, role FROM users WHERE id = $1`,
    [userId]
  );
  if (!userRows[0]) {
    throw { status: 404, message: "User not found" };
  }
  const user = userRows[0];

  const { rows: profileRows } = await db.query(
    `SELECT learning_style, goals, weak_topics, weekly_study_goal, onboarding_completed, streak_count, last_active_date
     FROM learning_profiles
     WHERE user_id = $1`,
    [userId]
  );
  let profile = profileRows[0];

  if (!profile) {
    const { rows: insertedProfile } = await db.query(
      `INSERT INTO learning_profiles (user_id, onboarding_completed, weekly_study_goal, streak_count, last_active_date)
       VALUES ($1, false, 5, 0, CURRENT_DATE)
       RETURNING learning_style, goals, weak_topics, weekly_study_goal, onboarding_completed, streak_count, last_active_date`,
      [userId]
    );
    profile = insertedProfile[0];
  }

  return { ...user, profile };
};

exports.updateProfile = async (userId, data) => {
  assertUuid(userId, "user id");

  const { name, learning_style, goals, weak_topics, weekly_study_goal, onboarding_completed } = data;

  if (name !== undefined) {
    await db.query(`UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2`, [name, userId]);
  }

  // we use COALESCE so if a field is not passed, it keeps the old value
  const weakTopicsJson = weak_topics ? JSON.stringify(weak_topics) : null;

  const { rows: updatedProfileRows } = await db.query(
    `INSERT INTO learning_profiles (user_id, learning_style, goals, weak_topics, weekly_study_goal, onboarding_completed, streak_count, last_active_date)
     VALUES ($1, $2, $3, COALESCE($4::jsonb, '[]'::jsonb), COALESCE($5, 5), COALESCE($6, false), 0, CURRENT_DATE)
     ON CONFLICT (user_id) DO UPDATE
     SET learning_style = COALESCE($2, learning_profiles.learning_style),
         goals = COALESCE($3, learning_profiles.goals),
         weak_topics = COALESCE($4::jsonb, learning_profiles.weak_topics),
         weekly_study_goal = COALESCE($5, learning_profiles.weekly_study_goal),
         onboarding_completed = COALESCE($6, learning_profiles.onboarding_completed),
         updated_at = NOW()
     RETURNING learning_style, goals, weak_topics, weekly_study_goal, onboarding_completed, streak_count, last_active_date`,
    [userId, learning_style, goals, weakTopicsJson, weekly_study_goal, onboarding_completed]
  );

  const { rows: userRows } = await db.query(
    `SELECT id, name, email, role FROM users WHERE id = $1`,
    [userId]
  );

  return { ...userRows[0], profile: updatedProfileRows[0] };
};
