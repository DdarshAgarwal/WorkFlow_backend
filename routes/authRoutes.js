const express = require("express");

const router = express.Router();

const {
  register,
  login,
  updateProfile,
  changePassword,
  forgotPassword,
  getSecurityQuestions,
  verifySecurityQuestions
} = require(
  "../controllers/authController"
);

const auth =
require("../middleware/auth");

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.put(
  "/profile",
  auth,
  updateProfile
);

router.post(
  "/change-password",
  auth,
  changePassword
);

router.get(
  "/security-questions",
  getSecurityQuestions
);

router.post(
  "/verify-security-questions",
  verifySecurityQuestions
);

router.post(
  "/forgot-password",
  forgotPassword
);

module.exports = router;