const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/auth");

const admin =
require("../middleware/admin");

const {

  dashboard,
  getLeaves,
  approveLeave,
  rejectLeave,

  getEmployees,
  addEmployee,
  updateEmployee,

  getOffice,
  updateOffice,

} = require(
  "../controllers/adminController"
);

router.get(
  "/dashboard",
  auth,
  admin,
  dashboard
);

router.get(
  "/leaves",
  auth,
  admin,
  getLeaves
);

router.put(
  "/approve/:id",
  auth,
  admin,
  approveLeave
);

router.put(
  "/reject/:id",
  auth,
  admin,
  rejectLeave
);

router.get(
  "/employees",
  auth,
  admin,
  getEmployees
);

router.post(
  "/employees",
  auth,
  admin,
  addEmployee
);

router.put(
  "/employees/:id",
  auth,
  admin,
  updateEmployee
);

router.delete(
  "/employees/:id",
  auth,
  admin,
  // delete employee
  require('../controllers/adminController').deleteEmployee
);

router.get(
  "/office",
  auth,
  admin,
  getOffice
);

router.put(
  "/office",
  auth,
  admin,
  updateOffice
);

module.exports = router;