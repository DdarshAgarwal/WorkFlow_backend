const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  clockIn,
  clockOut,
  getMyAttendance,
  getAttendanceStatus,
  getLateHistory,
} = require("../controllers/attendanceController");

// ===============================
// Attendance Routes
// ===============================

// Clock In
router.post(
  "/clock-in",
  auth,
  clockIn
);

// Clock Out
router.post(
  "/clock-out",
  auth,
  clockOut
);

// Attendance History
router.get(
  "/history",
  auth,
  getMyAttendance
);

router.get(
  "/late-history",
  auth,
  getLateHistory
);

// Get Current Attendance Status
router.get(
  "/status",
  auth,
  getAttendanceStatus
);

module.exports = router;