const express = require("express");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const router = express.Router();

const attendanceFile = path.join(__dirname, "../AttendanceRegister.json");
let attendanceData = JSON.parse(fs.readFileSync(attendanceFile));

// Teacher Portal Homepage
router.get("/", (req, res) => {
  const today = moment().format("YYYY-MM-DD");
  res.render("teacher", { students: attendanceData, date: today });
});

// Mark Attendance for a Selected Date
router.post("/mark-attendance", (req, res) => {
  const { date, attendance } = req.body; // `attendance` contains marked student IDs
  const selectedDate = moment(date).format("YYYY-MM-DD");

  // Mark attendance for students
  attendanceData = attendanceData.map(student => {
    if (!student.attendance) student.attendance = {}; // Initialize attendance object
    student.attendance[selectedDate] = attendance.includes(student.id.toString());
    return student;
  });

  // Save updated attendance data to file
  fs.writeFileSync(attendanceFile, JSON.stringify(attendanceData, null, 2));
  res.redirect("/teacher");
});

module.exports = router;
