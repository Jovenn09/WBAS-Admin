import React, { useState, useEffect, useContext } from "react";
import { FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import { Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Admin.css";
import AddNewSubjectModal from "./Subject/AddNewSubjectModal";
import AddNewUserModal from "./Teacher/AddNewUserModal";
import AddStudentModal from "./Student/AddStudentModal";
import EditSubjectModal from "./Subject/EditSubjectModal";
import EditTeacherModal from "./Teacher/EditTeacher";
import EditStudentModal from "./Student/EditStudentModal";
import Swal from "sweetalert2";
import supabase, { supabaseAdmin } from "../../config/supabaseClient";
import AddNewSectionModal from "./Section/AddNewSectionModal";
import EditSectionModal from "./Section/EditSectionModal";
import { AuthContext } from "../../context/AuthContext";

const Admin = () => {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [teachersData, setTeachersData] = useState([]);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [numOfTeachersData, setNumOfTeachersData] = useState(0);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSubjectEditModal, setShowSubjectEditModal] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState(null);
  const [subjectsData, setSubjectsData] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [numOfSubjectsData, setNumOfSubjectsData] = useState(0);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showStudentEditModal, setShowStudentEditModal] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [numOfStudentsData, setNumOfStudentsData] = useState(0);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSectionEditModal, setShowSectionEditModal] = useState(false);
  const [editSectionId, setEditSectionId] = useState(null);
  const [sectionData, setSectionData] = useState([]);
  const [sectionSearchTerm, setSectionSearchTerm] = useState("");
  const [numOfSectionsData, setNumOfSectionsData] = useState(0);

  const [activeTeacherPage, setActiveTeacherPage] = useState(1);
  const [activeSubjectPage, setActiveSubjectPage] = useState(1);
  const [activeStudentPage, setActiveStudentPage] = useState(1);
  const [activeSectionPage, setActiveSectionPage] = useState(1);

  const itemsPerPage = 5;

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // START TEACHER FUNCTION
  async function getNumTeachersData() {
    const { data, count, error } = await supabaseAdmin
      .from("teachers")
      .select("*", { count: "exact", head: true })
      .filter("name", "ilike", `%${teacherSearchTerm}%`);

    if (error) {
      console.error("Error fetching total rows:", error.message);
      return 0;
    }

    setNumOfTeachersData(count);
  }
  async function fetchTeachersData() {
    const start = (activeTeacherPage - 1) * itemsPerPage;
    const end = activeTeacherPage * itemsPerPage - 1;

    console.log(start, end);

    const { data, error } = await supabaseAdmin
      .from("teachers")
      .select("*")
      .order("name", { ascending: true })
      .filter("name", "ilike", `%${teacherSearchTerm}%`)
      .range(start, end);
    if (error) return console.error("Error fetching teachers");

    setTeachersData(data);
  }
  async function deleteTeacher(teacherId) {
    const { data, error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(teacherId);
    if (authError) return console.error(`Error deleting teacher account`);

    const { error: dataError } = await supabaseAdmin
      .from("teachers")
      .delete()
      .eq("uuid", teacherId);

    if (dataError)
      return console.error(`Error deleting teacher data from database`);
    fetchTeachersData();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Account deleted successfully.",
    });
  }
  const confirmDelete = (teacherId) => {
    Swal.fire({
      title: "Delete Teacher Account",
      text: "Are you sure you want to delete this teacher?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTeacher(teacherId);
      }
    });
  };

  useEffect(() => {
    fetchTeachersData();
    getNumTeachersData();
  }, [teacherSearchTerm, activeTeacherPage]);
  // END TEACHER FUNCTION

  // START SUBJECT FUNCTION
  async function getNumSubjectsData() {
    const { data, count, error } = await supabaseAdmin
      .from("subjects")
      .select("*", { count: "exact", head: true })
      .filter("subject_description", "ilike", `%${subjectSearchTerm}%`);

    if (error) {
      console.error("Error fetching total rows:", error.message);
      return 0;
    }

    setNumOfSubjectsData(count);
  }

  async function fetchSubjectsData() {
    const start = (activeSubjectPage - 1) * itemsPerPage;
    const end = activeSubjectPage * itemsPerPage - 1;

    const { data, error } = await supabaseAdmin
      .from("subjects")
      .select("*")
      .filter("subject_description", "ilike", `%${subjectSearchTerm}%`)
      .range(start, end);
    if (error) return console.error("Error fetching subjects");

    setSubjectsData(data);
  }

  const deleteSubject = async (subjectId) => {
    const { error } = await supabaseAdmin
      .from("subjects")
      .delete()
      .eq("subject_code", subjectId);

    if (error)
      return console.error(`Error deleting teacher data from database`);

    fetchSubjectsData();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Subject deleted successfully.",
    });
  };

  const confirmDeleteSubject = (subjectId) => {
    Swal.fire({
      title: "Delete Subject",
      text: "Are you sure you want to delete this subject?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      reverseButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSubject(subjectId);
      }
    });
  };

  useEffect(() => {
    fetchSubjectsData();
    getNumSubjectsData();
  }, [subjectSearchTerm, activeSubjectPage]);
  // END SUBJECT FUNCTION

  // START STUDENT FUNCTION
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
  useEffect(() => {
    fetchStudentData();
    getNumStudentsData();
  }, [studentSearchTerm, activeStudentPage]);
  // END STUDENT FUNCTION

  // START SECTION FUNCTION
  async function getNumSectionData() {
    const { data, count, error } = await supabaseAdmin
      .from("sections")
      .select("*", { count: "exact", head: true })
      .filter("section_code", "ilike", `%${sectionSearchTerm}%`);

    if (error) {
      console.error("Error fetching total rows:", error.message);
      return 0;
    }

    setNumOfSectionsData(count);
  }

  async function fetchSectionsData() {
    const start = (activeSectionPage - 1) * itemsPerPage;
    const end = activeSectionPage * itemsPerPage - 1;

    const { data, error } = await supabaseAdmin
      .from("sections")
      .select("*")
      .order("timestamp", { ascending: false })
      .ilike("section_code", `%${sectionSearchTerm}%`)
      .range(start, end);

    if (error) return console.error("Error fetching sections");

    setSectionData(data);
  }

  async function deleteSection(sectionId) {
    const { error } = await supabaseAdmin
      .from("sections")
      .delete()
      .eq("section_code", sectionId);

    if (error) return console.error(`Error deleting section from database`);

    fetchSectionsData();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Section deleted successfully.",
    });
  }

  async function confirmDeleteSection(sectionId) {
    Swal.fire({
      title: "Delete Subject",
      text: "Are you sure you want to delete this section?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      reverseButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSection(sectionId);
      }
    });
  }

  useEffect(() => {
    fetchSectionsData();
    getNumSectionData();
  }, [sectionSearchTerm, activeSectionPage]);
  // END SECTION FUNCTION

  useEffect(() => {
    fetchTeachersData();
    fetchSubjectsData();
    fetchStudentData();
    fetchSectionsData();
  }, [
    showModal,
    showSubjectModal,
    showStudentModal,
    showSectionModal,
    showEditModal,
  ]);

  const handleNewButtonClick = () => {
    setShowModal(true);
  };

  const handleNewSubjectButtonClick = () => {
    setShowSubjectModal(true);
  };

  const handleNewStudentButtonClick = () => {
    setShowStudentModal(true);
  };

  const handleNewSectionButtonClick = () => {
    setShowSectionModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowSubjectModal(false);
    setShowStudentModal(false);
    setShowSectionModal(false);
    setShowEditModal(false);
    setShowSectionEditModal(false);
    setShowSubjectEditModal(false);
    setShowStudentEditModal(false);
    setEditSubjectId(null);
    setEditStudentId(null);
  };

  const filteredSubjectUsers = subjectsData
    .filter((subject) => subject.subject_description)
    .filter((subject) =>
      subject.subject_description
        .toLowerCase()
        .includes(subjectSearchTerm.toLowerCase())
    );

  const filteredStudent = studentData
    .filter((student) => student.student_id)
    .filter((student) =>
      student.student_id.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );

  const handleEditClick = (teacherId) => {
    setEditUserId(teacherId);
    setShowEditModal(true);
  };

  const handleStudentEditClick = (studentId) => {
    setEditStudentId(studentId);
    setShowStudentEditModal(true);
  };

  const handleEditSubjectClick = (subjectId) => {
    setEditSubjectId(subjectId);
    setShowSubjectEditModal(true);
  };

  const handleEditSectionClick = (sectionId) => {
    setEditSectionId(sectionId);
    setShowSectionEditModal(true);
  };

  async function onLogout(e) {
    e.preventDefault();
    const { isConfirmed } = await Swal.fire({
      title: "Log out",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      reverseButton: true,
    });
    if (isConfirmed) {
      setUser(null);
      supabase.auth.signOut();
    }
  }

  return (
    <div>
      <header>
        <h1 className="admin-header">Student Attendance System</h1>
        {username && <span>Welcome, Admin {username}</span>}
        <div className="admin-logout-link">
          <a onClick={onLogout}>Logout</a>
        </div>
      </header>
      <div className="admin-container">
        <div className="table-container">
          <div className="user-search-filter">
            <h3>Teachers Account</h3>
            <input
              type="text"
              placeholder="Search teacher by name"
              value={teacherSearchTerm}
              onChange={(e) => setTeacherSearchTerm(e.target.value)}
            />
            <div className="new-button">
              <button onClick={handleNewButtonClick}>
                <FaPlus /> Create Teacher Account
              </button>
            </div>
          </div>
          <table className="table table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Name</th>
                <th>Gmail</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teachersData.map((teacher) => (
                <tr key={teacher.uuid}>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.role}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        title="Edit"
                        onClick={() => handleEditClick(teacher.uuid)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => confirmDelete(teacher.uuid)}
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
          {teachersData.length === 0 && (
            <div className="no-accounts-message">No user accounts found.</div>
          )}
          <Pagination>
            <Pagination.Prev
              onClick={() => setActiveTeacherPage((prev) => prev - 1)}
              disabled={activeTeacherPage === 1}
            />
            {[...Array(Math.ceil(numOfTeachersData / itemsPerPage))].map(
              (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === activeTeacherPage}
                  onClick={() => setActiveTeacherPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              )
            )}
            <Pagination.Next
              onClick={() => setActiveTeacherPage((prev) => prev + 1)}
              disabled={
                activeTeacherPage ===
                Math.ceil(numOfTeachersData / itemsPerPage)
              }
            />
          </Pagination>
        </div>
        <div className="table-container">
          <div className="user-search-filter">
            <h3>Subjects Management</h3>
            <input
              type="text"
              placeholder="Search Subjects"
              value={subjectSearchTerm}
              onChange={(e) => setSubjectSearchTerm(e.target.value)}
            />
            <div className="new-button">
              <button onClick={handleNewSubjectButtonClick}>
                <FaPlus /> Create New Subject
              </button>
            </div>
          </div>
          <table className="table table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Subject Code</th>
                <th>Subject Description</th>
                <th>Year Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjectUsers.map((subject) => (
                <tr key={subject.subject_code}>
                  <td>{subject.subject_code}</td>
                  <td>{subject.subject_description}</td>
                  <td>{subject.year_level}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        title="Edit"
                        onClick={() =>
                          handleEditSubjectClick(subject.subject_code)
                        }
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() =>
                          confirmDeleteSubject(subject.subject_code)
                        }
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
          {subjectsData.length === 0 && (
            <div className="no-accounts-message">No subjects found.</div>
          )}
          <Pagination>
            <Pagination.Prev
              onClick={() => setActiveSubjectPage(activeSubjectPage - 1)}
              disabled={activeSubjectPage === 1}
            />
            {[...Array(Math.ceil(numOfSubjectsData / itemsPerPage))].map(
              (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === activeSubjectPage}
                  onClick={() => setActiveSubjectPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              )
            )}
            <Pagination.Next
              onClick={() => setActiveSubjectPage(activeSubjectPage + 1)}
              disabled={
                activeSubjectPage ===
                Math.ceil(numOfSubjectsData / itemsPerPage)
              }
            />
          </Pagination>
        </div>

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
                        onClick={() =>
                          confirmDeleteStudentAccount(student.uuid)
                        }
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
                activeStudentPage ===
                Math.ceil(numOfStudentsData / itemsPerPage)
              }
            />
          </Pagination>
        </div>

        <div className="table-container">
          <div className="user-search-filter">
            <h3>Section Management</h3>
            <input
              type="text"
              placeholder="Search section"
              value={sectionSearchTerm}
              onChange={(e) => setSectionSearchTerm(e.target.value)}
            />
            <div className="new-button">
              <button onClick={handleNewSectionButtonClick}>
                <FaPlus /> Create Section
              </button>
            </div>
          </div>
          <table className="table table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Section Code</th>
                <th>Year Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sectionData.map((section) => (
                <tr key={section.section_code}>
                  <td>{section.section_code}</td>
                  <td>{section.year_level}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        title="Edit"
                        onClick={() =>
                          handleEditSectionClick(section.section_code)
                        }
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() =>
                          confirmDeleteSection(section.section_code)
                        }
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
          {sectionData.length === 0 && (
            <div className="no-accounts-message">No sections found.</div>
          )}
          <Pagination>
            <Pagination.Prev
              onClick={() => setActiveSectionPage(activeSectionPage - 1)}
              disabled={activeSectionPage === 1}
            />
            {[...Array(Math.ceil(numOfSectionsData / itemsPerPage))].map(
              (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === activeSectionPage}
                  onClick={() => setActiveSectionPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              )
            )}
            <Pagination.Next
              onClick={() => setActiveSectionPage(activeSectionPage + 1)}
              disabled={
                activeSectionPage ===
                Math.ceil(numOfSectionsData / itemsPerPage)
              }
            />
          </Pagination>
        </div>

        <AddNewUserModal show={showModal} closeModal={closeModal} />
        <AddNewSubjectModal show={showSubjectModal} closeModal={closeModal} />
        <AddStudentModal show={showStudentModal} closeModal={closeModal} />
        <AddNewSectionModal
          show={showSectionModal}
          closeModal={closeModal}
          refetchData={fetchSectionsData}
        />

        {/* Edit Modal */}
        <EditTeacherModal
          show={showEditModal}
          closeModal={closeModal}
          teacherId={editUserId}
          fetchTeachersData={fetchTeachersData}
        />
        <EditSubjectModal
          show={showSubjectEditModal}
          closeModal={closeModal}
          subjectId={editSubjectId}
          fetchSubjectsData={fetchSubjectsData}
        />
        <EditStudentModal
          show={showStudentEditModal}
          closeModal={closeModal}
          studentId={editStudentId}
          fetchStudentData={fetchStudentData}
        />
        <EditSectionModal
          show={showSectionEditModal}
          closeModal={closeModal}
          sectionId={editSectionId}
          fetchSectionData={fetchSectionsData}
        />
      </div>
      <div className="footer">
        <h6>© 2024 School Attendance System. All rights reserved.</h6>
      </div>
    </div>
  );
};

export default Admin;
