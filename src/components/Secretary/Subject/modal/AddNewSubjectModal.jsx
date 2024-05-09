import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../../config/supabaseClient";

const AddNewSubjectModal = ({ show, closeModal }) => {
  const [subjectDescription, setSubjectDescription] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [yearLevel, setYearLevel] = useState("1st Year College");

  const handleSubmit = async () => {
    const subjectData = {
      subject_description: subjectDescription,
      subject_code: subjectCode,
      year_level: yearLevel,
    };

    const { error: insertError } = await supabaseAdmin
      .from("subjects")
      .insert(subjectData);

    if (insertError) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: insertError.details,
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Subject created successfully!",
    });
    closeModal();
  };

  useEffect(() => {
    setSubjectDescription("");
    setSubjectCode("");
  }, [closeModal]);

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Subject</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formSubjectCode">
            <Form.Label>Subject Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter subject code"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formSubjectDescription">
            <Form.Label>Subject Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter subject description"
              value={subjectDescription}
              onChange={(e) => setSubjectDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formYearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Select
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
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
          Add Subject
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddNewSubjectModal;
