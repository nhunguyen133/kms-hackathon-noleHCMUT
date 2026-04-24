const progressService = require("./progress.service");

exports.getProgress = async (req, res, next) => {
  try {
    const data = await progressService.getStudentProgress(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
