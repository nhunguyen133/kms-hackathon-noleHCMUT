const express = require("express");
const { authenticate } = require("../../middleware/authenticate");
const { requireRole } = require("../../middleware/requireRole");
const coursesController = require("./courses.controller");

const router = express.Router();

// Public-ish reads still require auth for now (matches current middleware set)
router.get("/", authenticate, coursesController.list);
router.get("/enrolled", authenticate, coursesController.listEnrolled);
router.get("/:id", authenticate, coursesController.getById);

// Instructor CRUD
router.post(
  "/",
  authenticate,
  requireRole("instructor"),
  coursesController.create,
);
router.put(
  "/:id",
  authenticate,
  requireRole("instructor"),
  coursesController.update,
);
router.delete(
  "/:id",
  authenticate,
  requireRole("instructor"),
  coursesController.remove,
);

// Student enroll
router.post(
  "/:id/enroll",
  authenticate,
  coursesController.enroll,
);

// Nested convenience: lessons by course
router.get("/:id/lessons", authenticate, coursesController.listLessons);

module.exports = router;
