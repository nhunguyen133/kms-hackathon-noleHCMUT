const profileService = require("./profile.service");

exports.getProfile = async (req, res, next) => {
  try {
    const data = await profileService.getProfile(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const data = await profileService.updateProfile(req.user.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
