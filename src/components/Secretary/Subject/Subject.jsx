import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../config/supabaseClient";
import { FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import { Pagination } from "react-bootstrap";

// components
import AddNewSubjectModal from "./modal/AddNewSubjectModal";
import EditSubjectModal from "./modal/EditSubjectModal";

export default function Subject() {
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSubjectEditModal, setShowSubjectEditModal] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState(null);
  const [subjectsData, setSubjectsData] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [numOfSubjectsData, setNumOfSubjectsData] = useState(0);

  const [activeSubjectPage, setActiveSubjectPage] = useState(1);

  const itemsPerPage = 10;

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

  const handleNewSubjectButtonClick = () => {
    setShowSubjectModal(true);
  };

  const closeModal = () => {
    setShowSubjectModal(false);
    setShowSubjectEditModal(false);
    setEditSubjectId(null);
  };

  const handleEditSubjectClick = (subjectId) => {
    setEditSubjectId(subjectId);
    setShowSubjectEditModal(true);
  };

  const filteredSubjectUsers = subjectsData
    .filter((subject) => subject.subject_description)
    .filter((subject) =>
      subject.subject_description
        .toLowerCase()
        .includes(subjectSearchTerm.toLowerCase())
    );

  useEffect(() => {
    fetchSubjectsData();
    getNumSubjectsData();
  }, [subjectSearchTerm, activeSubjectPage]);

  return (
    <div className="admin-container">
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
                      onClick={() => confirmDeleteSubject(subject.subject_code)}
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
              activeSubjectPage === Math.ceil(numOfSubjectsData / itemsPerPage)
            }
          />
        </Pagination>
      </div>
      <AddNewSubjectModal show={showSubjectModal} closeModal={closeModal} />
      <EditSubjectModal
        show={showSubjectEditModal}
        closeModal={closeModal}
        subjectId={editSubjectId}
        fetchSubjectsData={fetchSubjectsData}
      />
    </div>
  );
}
