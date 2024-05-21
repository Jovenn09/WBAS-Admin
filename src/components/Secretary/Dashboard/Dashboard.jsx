import React, { useEffect, useState } from "react";
import { PiStudentBold } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { supabaseAdmin } from "../../../config/supabaseClient";
import AssignStudents from "../AssignStudents/AssignStudents";

export default function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalInstructors, setTotalInstructors] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalSections, setTotalSections] = useState(0);

  async function getNumberOfStudents() {
    let { data: students, error } = await supabaseAdmin
      .from("student_record")
      .select("id");

    if (error) console.log(error.message);

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

  return (
    <>
      <div className="admin-container ">
        <h2 className="text-center mb-5">Dashboard</h2>
        <section className="d-flex justify-content-center gap-3 flex-wrap">
          <div className="card mb-3" style={{ minWidth: "14rem" }}>
            <div className="card-body">
              <h3 className="card-title">Students</h3>
              <div className="d-flex align-items-center justify-content-between">
                <PiStudentBold size={33} />
                <span className="fs-5 fw-bold">{totalStudents}</span>
              </div>
            </div>
          </div>
          <div className="card mb-3" style={{ minWidth: "14rem" }}>
            <div className="card-body">
              <h3 className="card-title">Instructors</h3>
              <div className="d-flex align-items-center justify-content-between">
                <FaChalkboardTeacher size={33} />
                <span className="fs-5 fw-bold">{totalInstructors}</span>
              </div>
            </div>
          </div>
          <div className="card mb-3" style={{ minWidth: "14rem" }}>
            <div className="card-body">
              <h3 className="card-title">Subjects</h3>
              <div className="d-flex align-items-center justify-content-between">
                <FaBook size={33} />
                <span className="fs-5 fw-bold">{totalSubjects}</span>
              </div>
            </div>
          </div>
          <div className="card mb-3" style={{ minWidth: "14rem" }}>
            <div className="card-body">
              <h3 className="card-title">Section</h3>
              <div className="d-flex align-items-center justify-content-between">
                <SiGoogleclassroom size={33} />
                <span className="fs-5 fw-bold">{totalSections}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <AssignStudents />
    </>
  );
}
