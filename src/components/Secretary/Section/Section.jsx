import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../config/supabaseClient";
import { FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import { Pagination } from "react-bootstrap";
import Table from "react-bootstrap/Table";

// components
import AddNewSectionModal from "./modal/AddNewSectionModal";
import EditSectionModal from "./modal/EditSectionModal";

export default function Section() {
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSectionEditModal, setShowSectionEditModal] = useState(false);
  const [editSectionId, setEditSectionId] = useState(null);
  const [sectionData, setSectionData] = useState([]);
  const [sectionSearchTerm, setSectionSearchTerm] = useState("");
  const [numOfSectionsData, setNumOfSectionsData] = useState(0);
  const [activeSectionPage, setActiveSectionPage] = useState(1);
  const itemsPerPage = 10;

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
  const handleNewSectionButtonClick = () => {
    setShowSectionModal(true);
  };
  const closeModal = () => {
    setShowSectionModal(false);
    setShowSectionEditModal(false);
  };

  const handleEditSectionClick = (sectionId) => {
    setEditSectionId(sectionId);
    setShowSectionEditModal(true);
  };

  return (
    <div className="admin-container">
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
        <Table responsive className="table table-bordered">
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
                      onClick={() => confirmDeleteSection(section.section_code)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
              activeSectionPage === Math.ceil(numOfSectionsData / itemsPerPage)
            }
          />
        </Pagination>
      </div>
      <AddNewSectionModal
        show={showSectionModal}
        closeModal={closeModal}
        refetchData={fetchSectionsData}
      />
      <EditSectionModal
        show={showSectionEditModal}
        closeModal={closeModal}
        sectionId={editSectionId}
        fetchSectionData={fetchSectionsData}
      />
    </div>
  );
}
