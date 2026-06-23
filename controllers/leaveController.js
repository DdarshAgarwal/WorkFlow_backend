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

    const leave =
      await prisma.leave.create({
        data: {
          employeeId: userId,
          leaveType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason,
        },
      });

    res.status(201).json({
      success: true,
      leave,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

exports.getMyLeaves = async (req, res) => {
  try {

    const leaves =
      await prisma.leave.findMany({
        where: {
          employeeId:
            req.user.userId,
        },
        orderBy: {
          id: "desc",
        },
      });

    res.json({
      success: true,
      leaves,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};