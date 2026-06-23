const prisma = require("../lib/prisma");

const admin = async (
  req,
  res,
  next
) => {

  try {

    const user =
      await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
      });

    if (
      !user ||
      user.role !== "admin"
    ) {

      return res
        .status(403)
        .json({
          message:
            "Admin access required",
        });

    }

    next();

  } catch (error) {

    return res
      .status(500)
      .json({
        message:
          error.message,
      });

  }
};

module.exports = admin;