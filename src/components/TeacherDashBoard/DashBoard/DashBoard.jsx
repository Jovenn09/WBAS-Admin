import React, { useState, useEffect, useContext } from "react";
import { AiFillWarning } from "react-icons/ai";
import "./DashBoard.css";
import supabase, { supabaseAdmin } from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";
import { PiStudentBold } from "react-icons/pi";
import { FaBook } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { faker } from "@faker-js/faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Student Chart",
    },
  },
};

const labels = ["Current", "Expected"];

const studentData = (totalStudents, extraStudents) => {
  return {
    labels,
    datasets: [
      {
        data: [totalStudents, totalStudents + extraStudents],
        backgroundColor: ["#4caf507d", "#2195f36d"],
        borderColor: ["#4caf50", "#2196f3"],
        borderWidth: 2,
      },
    ],
  };
};

const subjectOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Number of Student in every subject",
    },
  },
};

const subjectsData = (subjectLabel, studentCountEachSubject) => {
  const subject = subjectLabel.map(
    (subject) =>
      `${subject.subject_id} - ${subject.subjects.subject_description}`
  );
  return {
    labels: subject,
    datasets: [
      {
        data: studentCountEachSubject,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
      },
    ],
  };
};

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
  const [studentCountEachSubject, setStudentCountEachSubject] = useState([]);
  const teacherId = sessionStorage.getItem("user_id");

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [extraStudents, setExtraStudents] = useState(0);

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

    let { count } = await supabase
      .from("students")
      .select("*", { head: true, count: "exact" });

    setExtraStudents(count);

    if (assignError) return console.log(error.message);

    const uniqueSection = Array.from(
      new Set(assign.map(({ section_id }) => section_id))
    );

    const uniqueSubject = Array.from(
      new Set(assign.map(({ subject_id }) => subject_id))
    );

    const subjectCountArr = await Promise.all(
      uniqueSubject.map(async (sub) => {
        let { count } = await supabase
          .from("student_record")
          .select("*", { head: true, count: "exact" })
          .eq("subject", sub);

        return count;
      })
    );
    setStudentCountEachSubject(subjectCountArr);

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
        {/* <div className="subject-filter">
          <label htmlFor="subjectSelect" className="small-label">
            Select Subject:
          </label>
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

        <p className="quick-access-text">Quick Access to Attendance Marking:</p>

        <button
          onClick={handleMarkAttendanceClick}
          className="mark-attendance-button"
        >
          Mark Attendance
        </button> */}

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

        <div style={{ width: "80%", margin: "auto", position: "relative" }}>
          <br />
          <br />
          <Bar
            options={options}
            data={studentData(totalStudents, extraStudents)}
          />
          <br />
          <br />
          <Bar
            options={subjectOptions}
            data={subjectsData(subjects, studentCountEachSubject)}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
