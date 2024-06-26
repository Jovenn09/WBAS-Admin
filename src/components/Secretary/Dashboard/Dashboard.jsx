import React, { useEffect, useState } from "react";
import { PiStudentBold } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { supabaseAdmin } from "../../../config/supabaseClient";
import AssignStudents from "../AssignStudents/AssignStudents";
import { useHistory } from "react-router-dom";
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

const options = {
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

const options1 = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Instructor, Subject, and Section Chart",
    },
  },
};

const labels = ["Current", "Expected"];
const labels1 = ["Instructor", "Subject", "Section"];

const data = (total, extra) => {
  return {
    labels,
    datasets: [
      {
        data: [total, total + extra],
        backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(54, 162, 235, 0.2)"],
        borderColor: ["rgb(75, 192, 192)", "rgb(54, 162, 235)"],
        borderWidth: 2,
      },
    ],
  };
};

const data1 = (instructor, subject, section) => {
  return {
    labels: labels1,
    datasets: [
      {
        data: [instructor, subject, section],
        backgroundColor: [
          "rgba(255, 205, 86, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(76, 175, 80, 0.2)",
        ],
        borderColor: [
          "rgb(255, 205, 86)",
          "rgb(255, 99, 132)",
          "rgb(76, 175, 80)",
        ],
        borderWidth: 2,
      },
    ],
  };
};

export default function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalInstructors, setTotalInstructors] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [extraStudent, setExtraStudent] = useState(0);

  const history = useHistory();

  async function getNumberOfStudents() {
    let { data: students, error } = await supabaseAdmin
      .from("student_record")
      .select("id");

    let { count } = await supabaseAdmin
      .from("students")
      .select("*", { head: true, count: "exact" });

    if (error) console.log(error.message);

    setExtraStudent(count);
    setTotalStudents(
      Array.from(new Set(students.map((student) => student.id))).length
    );
  }

  async function getNumberOfInstructor() {
    let { count, error } = await supabaseAdmin
      .from("teachers")
      .select("*", { count: "exact", head: true });

    if (error) console.log(error);
    setTotalInstructors(count);
  }

  async function getNumberOfSubjects() {
    let { count, error } = await supabaseAdmin
      .from("subjects")
      .select("*", { count: "exact", head: true });

    if (error) console.log(error);
    setTotalSubjects(count);
  }

  async function getNumberOfSections() {
    let { count, error } = await supabaseAdmin
      .from("sections")
      .select("*", { count: "exact", head: true });

    if (error) console.log(error);
    setTotalSections(count);
  }

  useEffect(() => {
    getNumberOfStudents();
    getNumberOfInstructor();
    getNumberOfSubjects();
    getNumberOfSections();
  }, []);

  const handleRoleClick = (role) => {
    switch (role) {
      case "instructor":
        history.push("instructor");
        break;
      case "student-account":
        history.push("student-account");
        break;
      case "class":
        history.push("class");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="admin-container ">
        <h2 className="text-center mb-5">Dashboard</h2>
        <section className="d-flex justify-content-center gap-3 flex-wrap">
          <div
            className="card mb-3"
            style={{ minWidth: "14rem", backgroundColor: "#2196F3" }}
          >
            <div
              className="card-body"
              onClick={() => handleRoleClick("student-account")}
            >
              <h3 className="card-title text-light">Students</h3>
              <div className="d-flex align-items-center justify-content-between">
                <PiStudentBold color="white" size={33} />
                <span className="fs-5 fw-bold text-light">{totalStudents}</span>
              </div>
            </div>
          </div>
          <div
            className="card mb-3"
            style={{ minWidth: "14rem", backgroundColor: "#FF9800" }}
          >
            <div
              className="card-body"
              onClick={() => handleRoleClick("instructor")}
            >
              <h3 className="card-title text-light">Instructors</h3>
              <div className="d-flex align-items-center justify-content-between">
                <FaChalkboardTeacher color="white" size={33} />
                <span className="fs-5 fw-bold text-light">
                  {totalInstructors}
                </span>
              </div>
            </div>
          </div>
          <div
            className="card mb-3"
            style={{ minWidth: "14rem", backgroundColor: "#F44336" }}
          >
            <div className="card-body" onClick={() => handleRoleClick("class")}>
              <h3 className="card-title text-light">Subjects</h3>
              <div className="d-flex align-items-center justify-content-between">
                <FaBook color="white" size={33} />
                <span className="fs-5 fw-bold text-light">{totalSubjects}</span>
              </div>
            </div>
          </div>
          <div
            className="card mb-3"
            style={{ minWidth: "14rem", backgroundColor: "#4CAF50" }}
          >
            <div className="card-body" onClick={() => handleRoleClick("class")}>
              <h3 className="card-title text-light">Section</h3>
              <div className="d-flex align-items-center justify-content-between">
                <SiGoogleclassroom color="white" size={33} />
                <span className="fs-5 fw-bold text-light">{totalSections}</span>
              </div>
            </div>
          </div>
        </section>
        <div style={{ width: "80%", margin: "auto" }}>
          <Bar options={options} data={data(totalStudents, extraStudent)} />
          <br />
          <Bar
            options={options1}
            data={data1(totalInstructors, totalSubjects, totalSections)}
          />
        </div>
      </div>
    </>
  );
}
