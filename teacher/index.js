const express = require("express");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const router = express.Router();
const attendanceFile = path.join(__dirname, "../AttendanceRegister.json");
let attendanceData = JSON.parse(fs.readFileSync(attendanceFile));

// Show Attendance and Mark Attendance
router.get("/", (req, res) => {
  const date = req.query.date || moment().format("DD-MM-YYYY");
  res.render("teacher", { students: attendanceData, date });
});

// Handle Attendance Submission
router.post("/mark-attendance", (req, res) => {
  const { date, attendance } = req.body;
  
  attendanceData.forEach(student => {
    if (!student.attendance) student.attendance = {};
    student.attendance[date] = attendance && attendance[student.id] === "present" ? "present" : "absent";
  });

  fs.writeFileSync(attendanceFile, JSON.stringify(attendanceData, null, 2));
  res.redirect(`/teacher?date=${date}`);
});

module.exports = router;
