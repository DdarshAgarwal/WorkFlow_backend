const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  clockIn,
  clockOut,
  getMyAttendance
} = require("../controllers/attendanceController");

router.post(
  "/clock-in",
  auth,
  clockIn
);

router.post(
  "/clock-out",
  auth,
  clockOut
);

router.get(
  "/history",
  auth,
  getMyAttendance
);
module.exports = router;