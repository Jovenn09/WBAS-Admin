import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { supabaseAdmin } from "../../../config/supabaseClient";
import Swal from "sweetalert2";

const EditSectionModal = ({
  show,
  closeModal,
  sectionId,
  fetchSectionData,
}) => {
  const [editedSectionData, setEditedSectionData] = useState({
    section_code: "",
    year_level: "",
  });

  useEffect(() => {
    if (sectionId) {
      const fetchSectionData = async () => {
        const { data, error } = await supabaseAdmin
          .from("sections")
          .select("*")
          .eq("section_code", sectionId);

        if (error) return console.error(`Error ${error}`);
        console.log("section data: ", data);
        setEditedSectionData(data[0]);
      };
      fetchSectionData();
    }
  }, [sectionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSectionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { error } = await supabaseAdmin
      .from("sections")
      .update(editedSectionData)
      .eq("section_code", sectionId);

    if (error) return console.error(`Error occur: ${error}`);
    fetchSectionData();
    closeModal();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Subject updated successfully.",
    });
  };

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Section</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formSubjectCode">
            <Form.Label>Section Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter section code"
              name="section_code"
              value={editedSectionData.section_code}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
        <Form.Group controlId="formYearLevel">
          <Form.Label>Year Level</Form.Label>
          <Form.Select
            value={editedSectionData.year_level}
            onChange={(e) =>
              setEditedSectionData((prev) => ({
                ...prev,
                year_level: e.target.value,
              }))
            }
          >
            <option value="1st Year College">1st Year College</option>
            <option value="2nd Year College">2nd Year College</option>
            <option value="3rd Year College">3rd Year College</option>
            <option value="4th Year College">4th Year College</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSectionModal;
