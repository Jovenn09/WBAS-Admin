import React, { useContext, useEffect, useState } from "react";
import "./Students.css";
import { Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import supabase from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddStudentModal from "./AddStudentModal";
import Swal from "sweetalert2";
import EditStudentModal from "./EditStudentModal";

const Students = () => {
  const { user } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const [currentStudentNum, setCurrentStudentNum] = useState("");
  const [currentStudentName, setCurrentStudentName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const itemsPerPage = 20;

  async function getStudents() {
    const { data, error } = await supabase
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

    const filteredSubjects = data.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.subject_id === item.subject_id)
    );

    const subjectOptions = filteredSubjects.map((data) => ({
      label: `${data.subject_id} - ${data.subjects.subject_description}`,
      value: data.subject_id,
    }));

    setSubjects(subjectOptions);
  }

  useEffect(() => {
    getStudents();
  }, []);

  async function getSections() {
    const { data, error } = await supabase
      .from("assign")
      .select("section_id")
      .eq("teacher_id", user.id)
      .eq("subject_id", subjectFilter);

    if (error) return console.log(error);

    const filteredSections = data.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.section_id === item.section_id)
    );

    const sectionOption = filteredSections.map((data) => data.section_id);

    setSections(sectionOption);
  }

  useEffect(() => {
    if (subjectFilter !== "") {
      getSections();
      return;
    }
    setBlockFilter("");
  }, [subjectFilter]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEditStudent = (studentId, studentName) => {
    setCurrentStudentNum(studentId);
    setCurrentStudentName(studentName);
    setShowEditModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    console.log(studentId);

    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!isConfirmed) return;

    try {
      const { error } = await supabase
        .from("student_record")
        .delete()
        .eq("id", studentId)
        .eq("subject", subjectFilter)
        .eq("section", blockFilter);

      if (error) throw new Error(error.message);

      Swal.fire(
        "Deleted!",
        "Student has been removed from the list",
        "success"
      );
      getStudentsBySection();
    } catch (error) {
      Swal.fire("Error", "Failed to delete student", "error");
    }
  };

  const handleAddStudent = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  async function getStudentsBySection() {
    if (blockFilter) {
      const start = (currentPage - 1) * itemsPerPage;
      const end = currentPage * itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from("student_record")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .eq("section", blockFilter)
        .eq("subject", subjectFilter)
        .ilike("name", `%${searchTerm}%`)
        .range(start, end);

      if (error) return console.log(error);

      setTotalStudents(count);
      setStudents(data);
    }
  }

  useEffect(() => {
    if (!blockFilter || !subjectFilter) {
      setStudents([]);
      return;
    }
    getStudentsBySection();
  }, [blockFilter, searchTerm, currentPage, subjectFilter]);

  return (
    <div className="student-container">
      <h1>Students</h1>
      <div className="filter-search-container">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <label className="blocks-container">
          Subject:
          <select
            onChange={(e) => {
              const value = e.target.value;
              setSubjectFilter(value);
            }}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </label>

        <label className="blocks-container">
          Section:
          <select
            onChange={(e) => {
              const value = e.target.value;
              setBlockFilter(value);
            }}
            disabled={subjectFilter === ""}
          >
            <option value="">Select Section</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </label>

        <button
          disabled={!blockFilter}
          className="add-student-button"
          onClick={handleAddStudent}
        >
          Add Student
        </button>
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>
                  <button
                    className="edit-icon"
                    onClick={() => handleEditStudent(student.id, student.name)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="delete-icon"
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No student found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination>
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {[...Array(Math.ceil(totalStudents / itemsPerPage))].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(totalStudents / itemsPerPage)}
        />
      </Pagination>
      <AddStudentModal
        show={showModal}
        onClose={handleModalClose}
        section={blockFilter}
        subject={subjectFilter}
        getStudentsBySection={getStudentsBySection}
      />
      <EditStudentModal
        show={showEditModal}
        section={blockFilter}
        subject={subjectFilter}
        getStudentsBySection={getStudentsBySection}
        currentStudentNum={currentStudentNum}
        setCurrentStudentNum={setCurrentStudentNum}
        currentStudentName={currentStudentName}
        setCurrentStudentName={setCurrentStudentName}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
      />
    </div>
  );
};

export default Students;
