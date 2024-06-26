import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../../config/supabaseClient";

const EditSectionModal = ({
  show,
  closeModal,
  sectionId,
  subjectId,
  refetchData,
}) => {
  const [editedSectionData, setEditedSectionData] = useState({
    subject_code: "",
    subject_description: "",
    section: "",
    year_level: "",
  });

  useEffect(() => {
    if (sectionId && subjectId) {
      const fetchSectionData = async () => {
        const { data, error } = await supabaseAdmin
          .from("section_subject")
          .select("*")
          .eq("subject_code", subjectId)
          .eq("section", sectionId);

        console.log(data);

        if (error) return console.error(`Error ${error}`);
        console.log("section data: ", data);
        setEditedSectionData(data[0]);
      };
      fetchSectionData();
    }
    console.log(sectionId, subjectId);
  }, [sectionId, subjectId]);

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
      .update({
        section_code: editedSectionData.section,
        year_level: editedSectionData.year_level,
      })
      .eq("section_code", sectionId);

    const { error: subjectError } = await supabaseAdmin
      .from("subjects")
      .update({
        subject_code: editedSectionData.subject_code,
        subject_description: editedSectionData.subject_description,
        year_level: editedSectionData.year_level,
      })
      .eq("subject_code", editedSectionData.subject_code);

    const { error: sectionError } = await supabaseAdmin
      .from("section_subject")
      .update([editedSectionData])
      .eq("subject_code", editedSectionData.subject_code)
      .eq("section", editedSectionData.section);

    if (error || sectionError || subjectError)
      return console.error(`Error occur: ${error}`);

    refetchData();

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
        <Form.Group className="mb-3" controlId="formSubjectCode">
          <Form.Label>Subject Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Subject code"
            name="subject_code"
            value={editedSectionData.subject_code}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formSubjectCode">
          <Form.Label>Subject Description</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Subject Description"
            name="subject_description"
            value={editedSectionData.subject_description}
            onChange={handleChange}
          />
        </Form.Group>
        <Form>
          <Form.Group controlId="formSubjectCode">
            <Form.Label>Section Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter section code"
              name="section"
              value={editedSectionData.section}
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
