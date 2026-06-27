const prisma = require("../lib/prisma");
const { getDistance } = require("geolib");

// ==============================
// CLOCK IN
// ==============================

exports.clockIn = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location is required.",
      });
    }

    // ==============================
    // Check Office Configuration
    // ==============================

    const office = await prisma.office.findFirst();

    if (!office) {
      return res.status(500).json({
        success: false,
        message: "Office has not been configured.",
      });
    }

    // ==============================
    // Check Geofence
    // ==============================

    const distance = getDistance(
      {
        latitude,
        longitude,
      },
      {
        latitude: office.latitude,
        longitude: office.longitude,
      }
    );

    if (distance > office.radius) {
      return res.status(403).json({
        success: false,
        message: `Outside office premises (${distance}m away).`,
      });
    }

    // ==============================
    // Prevent Duplicate Clock In
    // ==============================

    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: userId,
        clockOut: null,
      },
      orderBy: {
        id: "desc",
      },
    });

    if (activeAttendance) {
      return res.status(400).json({
        success: false,
        message: "You are already clocked in.",
      });
    }

    // ==============================
    // Create Attendance
    // ==============================

    // ==============================
// Create Attendance
// ==============================

const now = new Date();

const attendance = await prisma.attendance.create({
  data: {
    employeeId: userId,
    clockIn: now,
    latitude,
    longitude,
    status: "Present",
  },
});

// ======================================
// Late Detection using Office Settings
// ======================================

const [startHour, startMinute] =
  office.officeStartTime
    .split(":")
    .map(Number);

const allowedTime = new Date(now);

allowedTime.setHours(
  startHour,
  startMinute + office.graceMinutes,
  0,
  0
);

let isLate = false;

if (now > allowedTime) {

  isLate = true;

  await prisma.lateAttendance.create({

    data: {

      employeeId: userId,

      attendanceId: attendance.id,

      lateDate: now,

      clockIn: now,

    },

  });

}

return res.status(201).json({

  success: true,

  attendance,

  isLate,

  message: isLate
    ? "Clocked in successfully. You have been marked late."
    : "Clocked in successfully.",

});

    return res.status(201).json({
      success: true,
      message: "Clocked in successfully.",
      attendance,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to clock in.",
    });

  }
};

// ==============================
// CLOCK OUT
// ==============================

exports.clockOut = async (req, res) => {
  try {

    const userId = req.user.userId;

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: userId,
        clockOut: null,
      },
      orderBy: {
        id: "desc",
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No active attendance found.",
      });
    }

    const clockOutTime = new Date();

    const totalHours =
      (clockOutTime - attendance.clockIn) /
      (1000 * 60 * 60);

    const overtimeHours =
      Math.max(totalHours - 8, 0);

    const updatedAttendance =
      await prisma.attendance.update({
        where: {
          id: attendance.id,
        },
        data: {
          clockOut: clockOutTime,
          totalHours,
          overtimeHours,
        },
      });

    return res.json({
      success: true,
      message: "Clocked out successfully.",
      attendance: updatedAttendance,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to clock out.",
    });

  }
};

// ==============================
// GET MY ATTENDANCE HISTORY
// ==============================

exports.getMyAttendance = async (req, res) => {
  try {

    const userId = req.user.userId;

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: userId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return res.json({
      success: true,
      attendance,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance history.",
    });

  }
};

// ==============================
// GET CURRENT ATTENDANCE STATUS
// ==============================

exports.getAttendanceStatus = async (req, res) => {
  try {

    const userId = req.user.userId;

    const activeAttendance =       await prisma.attendance.findFirst({
        where: {
          employeeId: userId,
          clockOut: null,
        },
        orderBy: {
          id: "desc",
        },
      });

    return res.json({
      success: true,
      clockedIn: !!activeAttendance,
      attendance: activeAttendance || null,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance status.",
    });

  }
};
// =======================================
// GET LATE HISTORY
// =======================================

exports.getLateHistory = async (req, res) => {

  try {

    const userId = req.user.userId;

    const lateHistory =
      await prisma.lateAttendance.findMany({

        where: {
          employeeId: userId,
        },

        orderBy: {
          lateDate: "desc",
        },

      });

    const office =
      await prisma.office.findFirst();

    const result =
      lateHistory.map((late) => {

        const [hour, minute] =
          office.officeStartTime
            .split(":")
            .map(Number);

        const officeStart =
          new Date(late.clockIn);

        officeStart.setHours(
          hour,
          minute,
          0,
          0
        );

        const minutesLate =
          Math.max(
            0,
            Math.floor(
              (late.clockIn - officeStart) /
              (1000 * 60)
            )
          );

        return {

          ...late,

          minutesLate,

        };

      });

    return res.json({

      success: true,

      lateHistory: result,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch late history.",

    });

  }

};