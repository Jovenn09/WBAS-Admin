import React, { useState, useEffect, useContext } from "react";
import { AiFillWarning } from "react-icons/ai";
import "./DashBoard.css";
import supabase, { supabaseAdmin } from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";
import { PiStudentBold } from "react-icons/pi";
import { FaBook } from "react-icons/fa";

const Dashboard = ({ collapsed }) => {
  const { user } = useContext(AuthContext);
  const allAttendance = [
    {
      className: "Thesis Capstone",
      date: "2023-10-02",
    },
    {
      className: "Thesis Capstone",
      date: "2023-10-01",
    },

    {
      className: "Web Development",
      date: "2023-10-02",
    },
    {
      className: "Web Development",
      date: "2023-10-01",
    },
  ];
  const [subjects, setSubjects] = useState([]);
  const teacherId = sessionStorage.getItem("user_id");

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);

  console.log(user.id);
  useEffect(() => {
    const getSubjects = async () => {
      let { data, error } = await supabase
        .from("assign")
        .select(
          `
        subject_id,
        subjects (
        subject_description
      )
      `
        )
        .eq("teacher_id", user.id);

      if (error) return console.log(error);

      const subjects = data.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.subject_id === item.subject_id)
      );

      setSubjects(subjects);
    };
    getSubjects();
  }, []);

  const today = new Date().toLocaleDateString("en-US");

  const [selectedSubject, setSelectedSubject] = useState("All");

  const getPreviousDates = (dateString, count) => {
    const previousDates = [];
    const currentDate = new Date(dateString);

    for (let i = 0; i < count; i++) {
      const previousDate = new Date(currentDate);
      previousDate.setDate(currentDate.getDate() - i - 1);
      previousDates.push(previousDate.toISOString().split("T")[0]);
    }

    return previousDates;
  };

  const todayAttendance = allAttendance.filter(
    (attendance) =>
      (attendance.date === today && selectedSubject === "All") ||
      (attendance.date === today && attendance.className === selectedSubject)
  );

  const pendingAttendanceDates = getPreviousDates(today, 5);
  const pendingAttendance = allAttendance.filter(
    (attendance) =>
      pendingAttendanceDates.includes(attendance.date) &&
      (selectedSubject === "All" || attendance.className === selectedSubject)
  );

  const handleMarkAttendanceClick = () => {
    window.location.href = "/teacher-sidebar/attendance";
  };

  async function getNumberOfStudents() {
    let { data: assign, error: assignError } = await supabase
      .from("assign")
      .select("section_id, subject_id")
      .eq("teacher_id", user.id);

    if (assignError) return console.log(error.message);

    const uniqueSection = Array.from(
      new Set(assign.map(({ section_id }) => section_id))
    );

    const uniqueSubject = Array.from(
      new Set(assign.map(({ subject_id }) => subject_id))
    );

    console.log(uniqueSection);

    let { data: students, error } = await supabaseAdmin
      .from("student_record")
      .select("id")
      .in("section", uniqueSection);

    if (error) return console.log(error.message);

    const uniqueStudents = Array.from(
      new Set(students.map((student) => student.id))
    );

    setTotalStudents(uniqueStudents.length);
    setTotalSubjects(uniqueSubject.length);
  }

  useEffect(() => {
    getNumberOfStudents();
  }, []);

  return (
    <div className={`dashboard-container ${collapsed ? "collapsed" : ""}`}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </div>
      <div className="dashboard-content">
        <div className="subject-filter">
          <label htmlFor="subjectSelect" className="small-label">
            Select Subject:
          </label>
          {/* <select
            id="subjectSelect"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="small-select"
          >
            <option value="All">All</option>
            <option value="Thesis Capstone">Thesis Capstone</option>
            <option value="Web Development">Web Development</option>
          </select> */}
          <select
            className="small-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Choose a Subject</option>
            {subjects.map((subject) => (
              <option key={subject.subject_id} value={subject.subject_id}>
                {subject.subject_id} - {subject.subjects.subject_description}
              </option>
            ))}
          </select>
        </div>

        <div className="attendance-card today-attendance-card">
          <a href="/teacher-sidebar/attendance" className="attendance-link">
            <h2 className="attendance-card-title">
              Today's Attendance - Class:{" "}
              {selectedSubject === "All" ? "All Subjects" : selectedSubject} (
              {today})
            </h2>
            <ul>
              {todayAttendance.map((attendance, index) => (
                <li key={index}>
                  <strong>Class:</strong> {attendance.className}
                </li>
              ))}
            </ul>
          </a>
        </div>
        {/* <div className="attendance-card pending-attendance-card">
          <h2 className="attendance-card-title">
            Pending Attendance for{" "}
            {selectedSubject === "All" ? "All Subjects" : selectedSubject}
          </h2>
          <ul>
            {pendingAttendance.map((attendance, index) => (
              <li key={index}>
                <strong>Class:</strong> {attendance.className} (
                {attendance.date})
              </li>
            ))}
          </ul>
        </div> */}

        <section className="d-flex justify-content-center gap-3 flex-wrap">
          <div
            className="card mb-3"
            style={{ minWidth: "14rem", backgroundColor: "#2196F3" }}
          >
            <div className="card-body">
              <h3 className="card-title text-light">Students</h3>
              <div className="d-flex align-items-center justify-content-between">
                <PiStudentBold color="white" size={33} />
                <span className="fs-5 fw-bold text-light">{totalStudents}</span>
              </div>
            </div>
          </div>
          <div
            className="card mb-3"
            style={{ minWidth: "14rem", backgroundColor: "#4CAF50" }}
          >
            <div className="card-body">
              <h3 className="card-title text-light">Subjects</h3>
              <div className="d-flex align-items-center justify-content-between">
                <FaBook color="white" size={33} />
                <span className="fs-5 fw-bold text-light">{totalSubjects}</span>
              </div>
            </div>
          </div>
        </section>

        <p className="quick-access-text">Quick Access to Attendance Marking:</p>

        <button
          onClick={handleMarkAttendanceClick}
          className="mark-attendance-button"
        >
          Mark Attendance
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
