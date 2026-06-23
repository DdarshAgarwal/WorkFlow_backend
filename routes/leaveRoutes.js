const express = require("express");

const router = express.Router();

const auth =
  require("../middleware/auth");

const {
  applyLeave,
  getMyLeaves,
} = require(
  "../controllers/leaveController"
);

router.post(
  "/apply",
  auth,
  applyLeave
);

router.get(
  "/my-leaves",
  auth,
  getMyLeaves
);

module.exports = router;