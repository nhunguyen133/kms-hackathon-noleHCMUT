const lessonsService = require("./lessons.service");

exports.list = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const lessons = await lessonsService.listLessons({ courseId });
    res.json(lessons);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const lesson = await lessonsService.getLessonById(req.params.id);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      course_id,
      title,
      content,
      topic,
      difficulty_level,
      order,
      is_published,
    } = req.body;
    const created = await lessonsService.createLesson({
      teacherId: req.user.id,
      courseId: course_id,
      title,
      content,
      topic,
      difficultyLevel: difficulty_level,
      order,
      isPublished: is_published,
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, content, topic, difficulty_level, order, is_published } =
      req.body;
    const updated = await lessonsService.updateLesson(req.params.id, {
      teacherId: req.user.id,
      title,
      content,
      topic,
      difficultyLevel: difficulty_level,
      order,
      isPublished: is_published,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await lessonsService.deleteLesson(req.params.id, req.user.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
