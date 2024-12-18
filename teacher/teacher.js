const express = require("express");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const router = express.Router();

// Path to the attendance data
const attendanceFile = path.join(__dirname, "../AttendanceRegister.json");
let attendanceData = JSON.parse(fs.readFileSync(attendanceFile));

// Teacher Portal Homepage Route
router.get("/", (req, res) => {
  // Get date from query or default to today
  const date = req.query.date || moment().format("DD-MM-YYYY");
  res.render("teacher", { students: attendanceData, date });
});

// Mark Attendance for a Selected Date
router.post("/mark-attendance", (req, res) => {
  const { date, attendance } = req.body; // `attendance` contains marked student IDs
  const selectedDate = moment(date, "DD-MM-YYYY").format("YYYY-MM-DD"); // Convert input date to correct format

  if (!date || !attendance) {
    return res.redirect("/teacher");
  }

  // Mark attendance for students
  attendanceData = attendanceData.map(student => {
    if (!student.attendance) student.attendance = {}; // Initialize attendance object if not present

    // If no attendance exists for the selected date, set it to 'Not Filled'
    if (!student.attendance[selectedDate]) {
      student.attendance[selectedDate] = 'Not Filled'; // Initialize as 'Not Filled'
    }

    // Mark attendance as present if student is selected
    if (attendance.includes(student.id.toString())) {
      student.attendance[selectedDate] = 'present';
    } else if (!attendance.includes(student.id.toString()) && student.attendance[selectedDate] !== 'present') {
      student.attendance[selectedDate] = 'absent'; // Mark as absent if not present
    }

    return student;
  });

  // Save updated attendance data to file
  fs.writeFileSync(attendanceFile, JSON.stringify(attendanceData, null, 2));
  res.redirect("/teacher?date=" + selectedDate); // Redirect to the same date after updating
});

module.exports = router;
