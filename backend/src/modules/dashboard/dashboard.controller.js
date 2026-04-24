const dashboardService = require("./dashboard.service");

exports.overview = async (req, res, next) => {
	try {
		const data = await dashboardService.getOverview(req.user.id);
		res.json(data);
	} catch (err) {
		next(err);
	}
};

exports.students = async (req, res, next) => {
	try {
		const { courseId } = req.query;
		const students = await dashboardService.getStudents(req.user.id, { courseId });
		res.json({ students });
	} catch (err) {
		next(err);
	}
};

exports.studentDetail = async (req, res, next) => {
	try {
		const data = await dashboardService.getStudentDetail(req.user.id, req.params.id);
		res.json(data);
	} catch (err) {
		next(err);
	}
};

exports.atRisk = async (req, res, next) => {
	try {
		const { courseId } = req.query;
		const flags = await dashboardService.getAtRisk(req.user.id, { courseId });
		res.json({ at_risk: flags });
	} catch (err) {
		next(err);
	}
};
