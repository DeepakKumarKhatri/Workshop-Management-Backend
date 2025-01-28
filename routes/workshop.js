const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const WorkshopController = require("../controllers/workshop_controller");

router.post("/", authMiddleware(["mentor"]), WorkshopController.createWorkshop);
router.post(
  "/:workshopId/activities",
  authMiddleware(["mentor"]),
  WorkshopController.addActivity
);
router.post(
  "/:workshopId/enroll",
  authMiddleware(["learner"]),
  WorkshopController.enroll
);
router.get(
  "/enrolled",
  authMiddleware(["learner"]),
  WorkshopController.getEnrolledWorkshops
);
router.put(
  "/:workshopId/activities/:activityId",
  authMiddleware(["mentor"]),
  WorkshopController.updateActivity
);
router.delete(
  "/:workshopId/activities/:activityId",
  authMiddleware(["mentor"]),
  WorkshopController.deleteActivity
);

module.exports = router;
