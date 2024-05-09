import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../config/supabaseClient";
import { FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import { Pagination } from "react-bootstrap";

// components
import AddStudentModal from "./modal/AddStudentModal";
import EditStudentModal from "./modal/EditStudentModal";

export default function Student() {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showStudentEditModal, setShowStudentEditModal] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [numOfStudentsData, setNumOfStudentsData] = useState(0);

  const [activeStudentPage, setActiveStudentPage] = useState(1);

  const itemsPerPage = 10;

  async function getNumStudentsData() {
    const { data, count, error } = await supabaseAdmin
      .from("students")
      .select("*", { count: "exact", head: true })
      .filter("name", "ilike", `%${studentSearchTerm}%`);

    if (error) {
      console.error("Error fetching total rows:", error.message);
      return 0;
    }

    setNumOfStudentsData(count);
  }
  async function fetchStudentData() {
    const start = (activeStudentPage - 1) * itemsPerPage;
    const end = activeStudentPage * itemsPerPage - 1;

    console.log(studentSearchTerm);

    const { data, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .order("name", { ascending: true })
      .ilike("student_id", `%${studentSearchTerm}%`)
      .range(start, end);

    if (error) console.error("Error fetching students");

    setStudentData(data);
  }

  async function deleteStudent(studentId) {
    const { data, error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(studentId);
    if (authError) return console.error(`Error deleting student account`);

    const { error: dataError } = await supabaseAdmin
      .from("students")
      .delete()
      .eq("uuid", studentId);

    if (dataError)
      return console.error(`Error deleting teacher data from database`);

    fetchStudentData();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Account deleted successfully.",
    });
  }

  const confirmDeleteStudentAccount = (studentId) => {
    Swal.fire({
      title: "Delete Student Account",
      text: "Are you sure you want to delete this Account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      reverseButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteStudent(studentId);
      }
    });
  };

  const handleNewStudentButtonClick = () => {
    setShowStudentModal(true);
  };

  const closeModal = () => {
    setShowStudentModal(false);
    setShowStudentEditModal(false);
  };

  const filteredStudent = studentData
    .filter((student) => student.student_id)
    .filter((student) =>
      student.student_id.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );

  const handleStudentEditClick = (studentId) => {
    setEditStudentId(studentId);
    setShowStudentEditModal(true);
  };

  useEffect(() => {
    fetchStudentData();
    getNumStudentsData();
  }, [studentSearchTerm, activeStudentPage]);

  return (
    <div className="admin-container">
      <div className="table-container">
        <div className="user-search-filter">
          <h3>Student Management</h3>
          <input
            type="text"
            placeholder="Search by student id"
            value={studentSearchTerm}
            onChange={(e) => setStudentSearchTerm(e.target.value)}
          />
          <div className="new-button">
            <button onClick={handleNewStudentButtonClick}>
              <FaPlus /> Create Student Account
            </button>
          </div>
        </div>
        <table className="table table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              {/* <th>Section</th> */}
              <th>Year Level</th>
              <th>Address</th>
              <th>Contact Number</th>
              <th>Admission Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudent.map((student) => (
              <tr key={student.uuid}>
                <td>{student.student_id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.course}</td>
                {/* <td>{student.section}</td> */}
                <td>{student.year_level}</td>
                <td>{student.address}</td>
                <td>{student.contact_number}</td>
                <td>{student.admission_status}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-button"
                      title="Edit"
                      onClick={() => handleStudentEditClick(student.uuid)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => confirmDeleteStudentAccount(student.uuid)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {studentData.length === 0 && (
          <div className="no-accounts-message">No subjects found.</div>
        )}
        <Pagination>
          <Pagination.Prev
            onClick={() => setActiveStudentPage(activeStudentPage - 1)}
            disabled={activeStudentPage === 1}
          />
          {[...Array(Math.ceil(numOfStudentsData / itemsPerPage))].map(
            (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === activeStudentPage}
                onClick={() => setActiveStudentPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            )
          )}
          <Pagination.Next
            onClick={() => setActiveStudentPage(activeStudentPage + 1)}
            disabled={
              activeStudentPage === Math.ceil(numOfStudentsData / itemsPerPage)
            }
          />
        </Pagination>
      </div>
      <AddStudentModal show={showStudentModal} closeModal={closeModal} />
      <EditStudentModal
        show={showStudentEditModal}
        closeModal={closeModal}
        studentId={editStudentId}
        fetchStudentData={fetchStudentData}
      />
    </div>
  );
}
