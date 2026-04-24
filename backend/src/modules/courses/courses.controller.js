const coursesService = require("./courses.service");

exports.list = async (req, res, next) => {
  try {
    const courses = await coursesService.listCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const course = await coursesService.getCourseById(req.params.id);
    res.json(course);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, subject, is_published } = req.body;
    const created = await coursesService.createCourse({
      teacherId: req.user.id,
      title,
      description,
      subject,
      isPublished: is_published,
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, description, subject, is_published } = req.body;
    const updated = await coursesService.updateCourse(req.params.id, {
      teacherId: req.user.id,
      title,
      description,
      subject,
      isPublished: is_published,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await coursesService.deleteCourse(req.params.id, req.user.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

exports.enroll = async (req, res, next) => {
  try {
    const result = await coursesService.enrollStudent({
      courseId: req.params.id,
      studentId: req.user.id,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.listLessons = async (req, res, next) => {
  try {
    const lessons = await coursesService.listLessonsByCourse(req.params.id);
    res.json(lessons);
  } catch (err) {
    next(err);
  }
};
