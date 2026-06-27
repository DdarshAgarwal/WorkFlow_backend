const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sanitizeUser = (user) => {
  const {
    password,
    securityQuestions,
    ...safeUser
  } = user;

  return safeUser;
};

const answersMatch = (storedQuestions, answers) =>
  storedQuestions.every((q, index) => {
    if (!answers[index]) return false;

    return (
      q.answer.toLowerCase().trim() ===
      answers[index].toLowerCase().trim()
    );
  });

exports.register = async (req, res) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      password,
      department,
      securityQuestions
    } = req.body;

    const existingUser =
      await prisma.user.findUnique({
        where: { email }
      });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // ensure employeeId exists (generate next numeric id if not provided)
    let finalEmployeeId = employeeId;

    const extractNumber = (s) => {
      if (!s) return NaN;
      const m = s.match(/\d+/g);
      if (!m) return NaN;
      return parseInt(m[m.length - 1], 10);
    };

    if (finalEmployeeId) {
      // if provided, normalize to EMP### when possible
      const n = extractNumber(finalEmployeeId);
      if (!isNaN(n)) {
        finalEmployeeId = `EMP${String(n).padStart(3, "0")}`;
      }
    } else {
      // fetch all employeeIds and extract numeric parts to compute the next number
      const users = await prisma.user.findMany({ select: { employeeId: true } });

      let maxNum = 0;
      for (const u of users) {
        const n = extractNumber(u.employeeId);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }

      const nextNum = (maxNum || 0) + 1;
      finalEmployeeId = `EMP${String(nextNum).padStart(3, "0")}`;
    }

    const user =
      await prisma.user.create({
        data: {
          employeeId: finalEmployeeId,
          firstName,
          lastName,
          email,
          password: hashedPassword,
          department,
          securityQuestions: securityQuestions ? JSON.stringify(securityQuestions) : null
        }
      });

  // create JWT token for the newly registered user
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    success: true,
    token,
    user: sanitizeUser(user)
  });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
   try {

    const { email, password } = req.body;

    const user =
      await prisma.user.findUnique({
        where: { email }
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};

exports.updateProfile =
 async (req, res) => {

  try {

    const userId =
      req.user.userId;

    const {
      firstName,
      lastName
    } = req.body;

    const updatedUser =
      await prisma.user.update({

        where:  {
          id: userId
        },

        data: {

          firstName,
          lastName

        }

      });

    res.json({

      success: true,
      user: sanitizeUser(updatedUser)

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message

    });

  }

};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ success: true, user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, answers } = req.body;

    if (!email || !newPassword || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        message: "Email, new password, and security answers are required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.securityQuestions) {
      return res.status(400).json({ message: "User has not set security questions" });
    }

    const storedQuestions = JSON.parse(user.securityQuestions);

    if (!answersMatch(storedQuestions, answers)) {
      return res.status(400).json({ message: "Incorrect security question answers" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      user: sanitizeUser(updatedUser),
      message: "Password changed successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSecurityQuestions = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, securityQuestions: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.securityQuestions) {
      return res.status(400).json({ message: "User has not set security questions" });
    }

    const questions = JSON.parse(user.securityQuestions).map(({ question }) => ({
      question
    }));

    res.json({ questions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifySecurityQuestions = async (req, res) => {
  try {
    const { email, answers } = req.body;

    if (!email || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Email and answers are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, securityQuestions: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.securityQuestions) {
      return res.status(400).json({ message: "User has not set security questions" });
    }

    const storedQuestions = JSON.parse(user.securityQuestions);
    
    const allCorrect = answersMatch(storedQuestions, answers);

    if (!allCorrect) {
      return res.status(400).json({ message: "Incorrect security question answers" });
    }

    res.json({ success: true, message: "Security questions verified" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
