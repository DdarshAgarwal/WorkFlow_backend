const prisma = require("../lib/prisma");

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: "Leave can only be applied for today or future dates.",
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
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave history.",
    });

  }
};