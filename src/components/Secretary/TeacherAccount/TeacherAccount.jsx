import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../config/supabaseClient";
import { FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import { Pagination } from "react-bootstrap";

// components
import EditTeacherModal from "./modal/EditTeacher";
import AddNewUserModal from "./modal/AddNewUserModal";

export default function TeacherAccount() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [teachersData, setTeachersData] = useState([]);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [numOfTeachersData, setNumOfTeachersData] = useState(0);
  const [activeTeacherPage, setActiveTeacherPage] = useState(1);

  const itemsPerPage = 10;

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

  const handleEditClick = (teacherId) => {
    setEditUserId(teacherId);
    setShowEditModal(true);
  };

  const handleNewButtonClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowEditModal(false);
  };

  useEffect(() => {
    fetchTeachersData();
    getNumTeachersData();
  }, [teacherSearchTerm, activeTeacherPage]);

  return (
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {teachersData.map((teacher) => (
              <tr key={teacher.uuid}>
                <td>{teacher.name}</td>
                <td>{teacher.email}</td>
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
              activeTeacherPage === Math.ceil(numOfTeachersData / itemsPerPage)
            }
          />
        </Pagination>
        <AddNewUserModal show={showModal} closeModal={closeModal} />
        <EditTeacherModal
          show={showEditModal}
          closeModal={closeModal}
          teacherId={editUserId}
          fetchTeachersData={fetchTeachersData}
        />
      </div>
    </div>
  );
}
