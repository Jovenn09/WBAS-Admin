import React, { useState, useEffect, useContext } from "react";
import { AiFillWarning } from "react-icons/ai";
import "./DashBoard.css";
import supabase, { supabaseAdmin } from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";

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

        <p className="quick-access-text">Quick Access to Attendance Marking:</p>

        <button
          onClick={handleMarkAttendanceClick}
          className="mark-attendance-button"
        >
          Mark Attendance
        </button>
      </div>
      {/* <div className="absence-container">
        <div className="absence-warning">
          <h5>
            <AiFillWarning size={24} /> WARNING!
          </h5>
          1. Lebron James have 3 or more absences.
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
