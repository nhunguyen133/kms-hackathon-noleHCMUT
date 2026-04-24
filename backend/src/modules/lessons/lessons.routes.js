const express = require("express");
const { authenticate } = require("../../middleware/authenticate");
const { requireRole } = require("../../middleware/requireRole");
const lessonsController = require("./lessons.controller");

const router = express.Router();

router.get("/", authenticate, lessonsController.list);
router.get("/:id", authenticate, lessonsController.getById);

router.post(
  "/",
  authenticate,
  requireRole("instructor"),
  lessonsController.create,
);
router.put(
  "/:id",
  authenticate,
  requireRole("instructor"),
  lessonsController.update,
);
router.delete(
  "/:id",
  authenticate,
  requireRole("instructor"),
  lessonsController.remove,
);

module.exports = router;
