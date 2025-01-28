const express = require("express");
const router = express.Router();
const CalenderController = require("../controllers/google_calender");

router.get("/calendar", CalenderController.getCalender);
router.get("/callback", CalenderController.getCalenderCallback);

module.exports = router;
