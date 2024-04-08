import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { supabaseAdmin } from "../../../config/supabaseClient";
import Swal from "sweetalert2";

const EditSubjectModal = ({
  show,
  closeModal,
  subjectId,
  fetchSubjectsData,
}) => {
  const [editedSubjectData, setEditedSubjectData] = useState({
    subject_description: "",
    subject_code: "",
    year_level: "",
  });

  useEffect(() => {
    const fetchSubjectsData = async () => {
      const { data, error } = await supabaseAdmin
        .from("subjects")
        .select("*")
        .eq("subject_code", subjectId);

      if (error) return console.error(`Error ${error}`);
      setEditedSubjectData(data[0]);
    };
    if (subjectId) {
      fetchSubjectsData();
    }
  }, [show, subjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSubjectData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { error } = await supabaseAdmin
      .from("subjects")
      .update(editedSubjectData)
      .eq("subject_code", subjectId);

    if (error) return console.error(`Error occur: ${error}`);
    fetchSubjectsData();
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
        <Modal.Title>Edit Subject</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formSubjectCode">
            <Form.Label>Subject Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter subject code"
              name="subject_code"
              value={editedSubjectData.subject_code}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formSubjectDescription">
            <Form.Label>Subject Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter subject description"
              name="subject_description"
              value={editedSubjectData.subject_description}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formYearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Select
              value={editedSubjectData.year_level}
              onChange={(e) =>
                setEditedSubjectData((prev) => ({
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
        </Form>
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

export default EditSubjectModal;
