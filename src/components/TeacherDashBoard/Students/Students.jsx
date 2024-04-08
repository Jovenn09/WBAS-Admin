import React, { useContext, useEffect, useState } from "react";
import "./Students.css";
import { Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import supabase from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import AddStudentModal from "./AddStudentModal";

const Students = () => {
  const { user } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  // const [showModal, setShowModal] = useState(false);
  // const [newStudent, setNewStudent] = useState({
  //   id: "",
  //   name: "",
  //   classes: [],
  //   yearLevel: "",
  //   blocks: "",
  //   contactNo: "",
  //   address: "",
  // });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

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

  // const handleEditStudent = (studentId) => {
  //   console.log(`Editing student with ID: ${studentId}`);
  // };

  // const handleDeleteStudent = (studentId) => {
  //   console.log(studentId);

  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: "You won't be able to revert this!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes, delete it!",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       axios
  //         .post("http://localhost:8081/remove-student", { studentId })
  //         .then((response) => {
  //           if (response.data.success) {
  //             Swal.fire(
  //               "Deleted!",
  //               "Student has been removed from the list",
  //               "success"
  //             ).then(() => {
  //               window.location.reload();
  //             });
  //           } else {
  //             Swal.fire("Error", "Failed to delete student", "error");
  //           }
  //         })
  //         .catch((error) => {
  //           Swal.fire("Error", "Failed to delete student", "error");
  //         });
  //     }
  //   });
  // };

  // const handleAddStudent = () => {
  //   setShowModal(true);
  // };

  // const handleModalSave = () => {
  //   console.log("Saving new student:", newStudent);
  //   setShowModal(false);
  // };

  // const handleModalClose = () => {
  //   setShowModal(false);
  // };

  // const handleModalChange = (e) => {
  //   const { name, value } = e.target;
  //   setNewStudent((prevStudent) => ({
  //     ...prevStudent,
  //     [name]: value,
  //   }));
  // };

  async function getStudentsBySection() {
    if (blockFilter) {
      const start = (currentPage - 1) * itemsPerPage;
      const end = currentPage * itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from("students")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .contains("sections", [blockFilter])
        .contains("subjects", [subjectFilter])
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

        {/* <button className="add-student-button" onClick={handleAddStudent}>
          Add Student
        </button> */}
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Course</th>
            <th>Year Level</th>
            {/* <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.uuid}>
                <td>{student.student_id}</td>
                <td>{student.name}</td>
                <td>{student.course}</td>
                <td>{student.year_level}</td>
                {/* <td>
                  <button
                    className="edit-icon"
                    onClick={() => handleEditStudent(student.uuid)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="delete-icon"
                    onClick={() => handleDeleteStudent(student.uuid)}
                  >
                    <FaTrash />
                  </button>
                </td> */}
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
      {/* <AddStudentModal
        show={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onChange={handleModalChange}
        newStudent={newStudent}
      /> */}
    </div>
  );
};

export default Students;
