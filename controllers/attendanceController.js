const prisma = require("../lib/prisma");

const {
  getDistance
} = require("geolib");


exports.clockIn = async (req, res) => {

  try {

    const userId =
      req.user.userId;

    const {
      latitude,
      longitude
    } = req.body;

    if (
      !latitude ||
      !longitude
    ) {

      return res
        .status(400)
        .json({
          message:
            "Location required"
        });

    }

  const office =
  await prisma.office.findFirst();

if (!office) {

  return res.status(500).json({
    message: "Office not configured"
  });

}

const distance =
  getDistance(
    {
      latitude,
      longitude
    },
    {
      latitude: office.latitude,
      longitude: office.longitude
    }
  );

 if (
  distance >
  office.radius
) {

      return res
        .status(403)
        .json({
          message:
            `Outside office premises (${distance}m away)`
        });

    }

    const attendance =
      await prisma.attendance.create({
        data: {
          employeeId:
            userId,

          clockIn:
            new Date(),

          latitude,

          longitude,

          status:
            "Present"
        }
      });

    res.status(201).json({
      success: true,
      attendance
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message
    });

  }

};

exports.clockOut = async (
  req,
  res
) => {

  try {

    const userId =
      req.user.userId;

    const attendance =
      await prisma.attendance.findFirst({
        where: {
          employeeId:
            userId,

          clockOut:
            null
        },

        orderBy: {
          id: "desc"
        }
      });

    if (
      !attendance
    ) {

      return res
        .status(404)
        .json({
          message:
            "No active attendance found"
        });

    }

    const clockOutTime =
      new Date();

    const totalHours =
      (
        clockOutTime -
        attendance.clockIn
      ) /
      (
        1000 *
        60 *
        60
      );

    const overtimeHours =
      Math.max(
        totalHours - 8,
        0
      );

    const updatedAttendance =
      await prisma.attendance.update({
        where: {
          id:
            attendance.id
        },

        data: {
          clockOut:
            clockOutTime,

          totalHours,

          overtimeHours
        }
      });

    res.json({
      success: true,
      attendance:
        updatedAttendance
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message
    });

  }

};

exports.getMyAttendance =
async (
  req,
  res
) => {

  try {

    const userId =
      req.user.userId;

    const attendance =
      await prisma.attendance.findMany({
        where: {
          employeeId:
            userId
        },

        orderBy: {
          date:
            "desc"
        }
      });

    res.json({
      success: true,
      attendance
    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message
    });

  }

};