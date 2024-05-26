import React, { useEffect, useState } from "react";
import { PiStudentBold } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { supabaseAdmin } from "../../../config/supabaseClient";
import AssignStudents from "../AssignStudents/AssignStudents";
import { useHistory } from "react-router-dom";

export default function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalInstructors, setTotalInstructors] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalSections, setTotalSections] = useState(0);

  const history = useHistory();

  async function getNumberOfStudents() {
    let { data: students, error } = await supabaseAdmin
      .from("students")
      .select("student_id");

    if (error) console.log(error.message);

    setTotalStudents(
      Array.from(new Set(students.map((student) => student.student_id))).length
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
      </div>
    </>
  );
}
