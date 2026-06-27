const prisma =
require("../lib/prisma");
const bcrypt = require("bcryptjs");

exports.dashboard =
async (req, res) => {

  try {

    const totalEmployees =
      await prisma.user.count();

    const totalAttendance =
      await prisma.attendance.count();

     

      

    const pendingLeaves =
      await prisma.leave.count({
        where: {
          status: "Pending",
        },
      });

    res.json({
      totalEmployees,
      totalAttendance,
      pendingLeaves,
    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }

};

exports.getLeaves =
async (req, res) => {

  try {

    const leaves =
      await prisma.leave.findMany({
        orderBy: {
          id: "desc",
        },
      });

    res.json(leaves);

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }

};

exports.approveLeave =
async (req, res) => {

  const { id } = req.params;

  const leave =
    await prisma.leave.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "Approved",
      },
    });

  res.json(leave);

};

exports.rejectLeave =
async (req, res) => {

  const { id } = req.params;

  const leave =
    await prisma.leave.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "Rejected",
      },
    });

  res.json(leave);

};
exports.getEmployees = async (req, res) => {

  try {

    const employees =
      await prisma.user.findMany({
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          department: true,
          createdAt: true,
        },
        orderBy: {
          id: "desc",
        },
      });

    res.json(employees);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};
exports.addEmployee = async (
  req,
  res
) => {

  try {

    const {
      employeeId,
      firstName,
      lastName,
      email,
      password,
      department,
    } = req.body;

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {

      return res
        .status(400)
        .json({
          message:
            "User already exists",
        });

    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await prisma.user.create({
        data: {
          employeeId,
          firstName,
          lastName,
          email,
          password:
            hashedPassword,
          department,
        },
      });

    res.status(201).json({
      success: true,
      user,
    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }

};
exports.getOffice = async (req, res) => {
  try {

    let office = await prisma.office.findFirst();

    // Create default office if it doesn't exist
    if (!office) {

      office = await prisma.office.create({
        data: {
          name: "My Office",
          latitude: 0,
          longitude: 0,
          radius: 100,

          officeStartTime: "10:00",
          officeEndTime: "19:00",

          graceMinutes: 15,

          fullDayHours: 8,

          halfDayHours: 4,

          workingDays:
            "Monday,Tuesday,Wednesday,Thursday,Friday",

          timezone:
            "Asia/Kolkata",
        },
      });

    }

    return res.json({
      success: true,
      office,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch office settings.",
    });

  }

};

exports.updateOffice = async (req, res) => {

  try {

    const {

      name,

      latitude,

      longitude,

      radius,

      officeStartTime,

      officeEndTime,

      graceMinutes,

      fullDayHours,

      halfDayHours,

      workingDays,

      timezone,

    } = req.body;

    let office =
      await prisma.office.findFirst();

    if (!office) {

      office =
        await prisma.office.create({
          data: {

            name,

            latitude: Number(latitude),

            longitude: Number(longitude),

            radius: Number(radius),

            officeStartTime,

            officeEndTime,

            graceMinutes: Number(graceMinutes),

            fullDayHours:
              Number(fullDayHours),

            halfDayHours:
              Number(halfDayHours),

            workingDays,

            timezone,

          },
        });

      return res.json({
        success: true,
        office,
      });

    }

    const updated =
      await prisma.office.update({

        where: {
          id: office.id,
        },

        data: {

          name,

          latitude:
            Number(latitude),

          longitude:
            Number(longitude),

          radius:
            Number(radius),

          officeStartTime,

          officeEndTime,

          graceMinutes:
            Number(graceMinutes),

          fullDayHours:
            Number(fullDayHours),

          halfDayHours:
            Number(halfDayHours),

          workingDays,

          timezone,

        },

      });

    return res.json({

      success: true,

      office: updated,

      message:
        "Office settings updated successfully.",

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message:
        "Failed to update office settings.",

    });

  }

};
exports.updateEmployee = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;

    const {
      firstName,
      lastName,
      email,
      department,
      role,
    } = req.body;

    // build data object only with provided fields to allow partial updates
    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (email !== undefined) data.email = email;
    if (department !== undefined) data.department = department;
    if (role !== undefined) data.role = role;

    const employee =
      await prisma.user.update({
        where: {
          id: Number(id),
        },
        data,
      });

    res.json({
      success: true,
      employee,
    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }

};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    // remove related attendance and leave records first
    await prisma.attendance.deleteMany({ where: { employeeId: userId } });
    await prisma.leave.deleteMany({ where: { employeeId: userId } });

    const deleted = await prisma.user.delete({ where: { id: userId } });

    res.json({ success: true, user: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};