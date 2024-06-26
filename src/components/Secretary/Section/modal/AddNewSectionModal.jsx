import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../../config/supabaseClient";

const AddNewSectionModal = ({ show, closeModal, refetchData }) => {
  const [sectionCode, setSectionCode] = useState("");
  const [sectionYear, setSectionYear] = useState("1st Year College");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error: insertError } = await supabaseAdmin
      .from("sections")
      .insert({ section_code: sectionCode, year_level: sectionYear });

    const { error: subjectError } = await supabaseAdmin
      .from("subjects")
      .insert({
        subject_code: subjectCode,
        subject_description: subjectDescription,
        year_level: sectionYear,
      });

    const { error: sectionError } = await supabaseAdmin
      .from("section_subject")
      .insert({
        subject_code: subjectCode,
        section: sectionCode,
        subject_description: subjectDescription,
        year_level: sectionYear,
      });

    if (insertError || subjectError || sectionError) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: insertError.details,
      });
      return;
    }

    setSectionCode("");
    refetchData();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Section created successfully!",
    });
    closeModal();
  };

  useEffect(() => {
    setSectionCode("");
  }, [closeModal]);

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Class</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Form.Group className="mb-3" controlId="formSubjectCode">
            <Form.Label>Subject Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Subject code"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formSubjectCode">
            <Form.Label>Subject Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Subject Description"
              value={subjectDescription}
              onChange={(e) => setSubjectDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formSubjectCode">
            <Form.Label>Section</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Section code"
              value={sectionCode}
              onChange={(e) => setSectionCode(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formYearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Select
              value={sectionYear}
              onChange={(e) => setSectionYear(e.target.value)}
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
          Add Class
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddNewSectionModal;
