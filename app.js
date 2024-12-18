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
let attendanceData = JSON.parse(fs.readFileSync(attendanceFile, "utf-8"));

// Homepage Route
app.get("/", (req, res) => {
  // Calculate class average attendance
  let totalPresentDays = 0;
  let totalSchoolDays = 0;

  attendanceData.forEach((student) => {
    const studentDays = Object.keys(student.attendance).length;
    totalSchoolDays = Math.max(totalSchoolDays, studentDays); // Ensure correct count
    totalPresentDays += Object.values(student.attendance).filter((status) => status === "present").length;
  });

  // Calculate the class average attendance percentage
  const classAverage = totalSchoolDays
    ? ((totalPresentDays / (totalSchoolDays * attendanceData.length)) * 100).toFixed(2)
    : "N/A";

  // Render the homepage with student data and class average
  const students = attendanceData.map((student) => ({
    id: student.id,
    name: student.name,
    attendance: totalSchoolDays
      ? ((Object.values(student.attendance).filter((status) => status === "present").length / totalSchoolDays) * 100).toFixed(2)
      : "N/A",
  }));

  res.render("index", { students, classAverage });
});

// Student Details Route
app.get("/student/:id", (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = attendanceData.find((s) => s.id === studentId);

  if (!student) {
    return res.status(404).send("Student not found");
  }

  // Calculate present days for this student
  const presentDays = Object.values(student.attendance).filter((status) => status === "present").length;
  const totalSchoolDays = Object.keys(student.attendance).length;
  const attendancePercentage = totalSchoolDays
    ? ((presentDays / totalSchoolDays) * 100).toFixed(2)
    : "N/A";

  // Generate events for the calendar
  const events = [];
  const studentAttendance = student.attendance || {};

  // Add attendance events
  Object.entries(studentAttendance).forEach(([date, status]) => {
    events.push({
      title: status.charAt(0).toUpperCase() + status.slice(1),
      start: date,
      backgroundColor: status === "present" ? "green" : "red",
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

// Teacher's Portal (Handled by teacherRouter)
const teacherRouter = require("./teacher");
app.use("/teacher", teacherRouter);

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
