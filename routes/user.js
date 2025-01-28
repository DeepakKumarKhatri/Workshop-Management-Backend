const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user_controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/auth/login", UserController.login);
router.post("/auth/register", UserController.register);
router.put(
  "/notification-preferences",
  authMiddleware(["mentor", "learner"]),
  UserController.updateNotificationPreferences
);

module.exports = router;
