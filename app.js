const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const moment = require("moment");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Load Attendance Data
const attendanceFile = path.join(__dirname, "AttendanceRegister.json");
let attendanceData = JSON.parse(fs.readFileSync(attendanceFile));

// Homepage Route
app.get("/", (req, res) => {
  // Calculate class average attendance
  let totalPresentDays = 0;
  let totalSchoolDays = 0;

  attendanceData.forEach(student => {
    totalSchoolDays = Object.keys(student.attendance).length;
    totalPresentDays += Object.values(student.attendance).filter(status => status).length;
  });

  // Calculate the class average attendance percentage
  const classAverage = ((totalPresentDays / (totalSchoolDays * attendanceData.length)) * 100).toFixed(2);

  // Render the homepage with student data and class average
  const students = attendanceData.map(student => ({
    id: student.id,
    name: student.name,
    attendance: ((Object.values(student.attendance).filter(status => status).length / totalSchoolDays) * 100).toFixed(2)
  }));

  res.render("index", { students, classAverage });
});

// Student Details Route
app.get("/student/:id", (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = attendanceData.find(s => s.id === studentId);

  if (!student) {
    return res.status(404).send("Student not found");
  }

  // Calculate present days for this student
  const presentDays = Object.values(student.attendance).filter(status => status).length;
  const totalSchoolDays = Object.keys(student.attendance).length;
  const attendancePercentage = ((presentDays / totalSchoolDays) * 100).toFixed(2);

  // Generate events for the calendar
  const events = [];
  const studentAttendance = student.attendance || {};

  // Add attendance events
  Object.entries(studentAttendance).forEach(([date, isPresent]) => {
    events.push({
      title: isPresent ? "Present" : "Absent",
      start: date,
      backgroundColor: isPresent ? "green" : "red",
      textColor: "white",
    });
  });

  res.render("student", {
    student,
    events,
    totalSchoolDays,
    presentDays,
    attendancePercentage,
  });
});

// Teacher's Portal
const teacherRouter = require("./teacher");
app.use("/teacher", teacherRouter);

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
