const prisma = require("../lib/prisma");

const ANNUAL_LEAVE_ALLOWANCE = 15;

const startOfDay = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const getInclusiveDays = (startDate, endDate) => {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

const getLeaveSummary = async (employeeId) => {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const [leaves, lateDays] = await Promise.all([
    prisma.leave.findMany({
      where: {
        employeeId,
        status: {
          not: "Rejected",
        },
        startDate: {
          lte: yearEnd,
        },
        endDate: {
          gte: yearStart,
        },
      },
    }),
    prisma.lateAttendance.count({
      where: {
        employeeId,
        lateDate: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
    }),
  ]);

  const usedLeaveDays = leaves.reduce((total, leave) => {
    const start = leave.startDate < yearStart ? yearStart : leave.startDate;
    const end = leave.endDate > yearEnd ? yearEnd : leave.endDate;

    return total + getInclusiveDays(start, end);
  }, 0);

  const lateLeaveDeductions = Math.floor(lateDays / 3);
  const usedWithLateDeductions = usedLeaveDays + lateLeaveDeductions;

  return {
    year: now.getFullYear(),
    annualAllowance: ANNUAL_LEAVE_ALLOWANCE,
    usedLeaveDays,
    lateDays,
    lateLeaveDeductions,
    remainingLeaveDays: Math.max(
      ANNUAL_LEAVE_ALLOWANCE - usedWithLateDeductions,
      0
    ),
  };
};

exports.applyLeave = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    // ===========================
    // Validation
    // ===========================

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const today = startOfDay(new Date());
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);

    if (start <= today) {
      return res.status(400).json({
        success: false,
        message: "Leave can only be applied for future dates.",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    // ===========================
    // Prevent overlapping leave
    // ===========================

    const existingLeave = await prisma.leave.findFirst({
      where: {
        employeeId: userId,
        status: {
          not: "Rejected",
        },
        OR: [
          {
            startDate: {
              lte: end,
            },
            endDate: {
              gte: start,
            },
          },
        ],
      },
    });

    if (existingLeave) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a leave request during the selected dates.",
      });
    }

    const requestedDays = getInclusiveDays(start, end);
    const leaveSummary = await getLeaveSummary(userId);

    if (requestedDays > leaveSummary.remainingLeaveDays) {
      return res.status(400).json({
        success: false,
        message:
          "This request exceeds your remaining annual leave balance.",
        leaveSummary,
      });
    }

    // ===========================
    // Create Leave
    // ===========================

    const leave = await prisma.leave.create({
      data: {
        employeeId: userId,
        leaveType,
        startDate: start,
        endDate: end,
        reason: reason.trim(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Leave applied successfully.",
      leave,
      leaveSummary: await getLeaveSummary(userId),
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while applying leave.",
    });

  }
};

exports.getMyLeaves = async (req, res) => {
  try {

    const leaves = await prisma.leave.findMany({
      where: {
        employeeId: req.user.userId,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return res.json({
      success: true,
      leaves,
      leaveSummary: await getLeaveSummary(req.user.userId),
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave history.",
    });

  }
};
