require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require(path.join(__dirname, "routes", "authRoutes.js"));
const attendanceRoutes = require(path.join(__dirname, "routes", "attendanceRoutes.js"));
const leaveRoutes = require(path.join(__dirname, "routes", "leaveRoutes.js"));
const adminRoutes = require(path.join(__dirname, "routes", "adminRoutes.js"));

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("WORKFLOW API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});