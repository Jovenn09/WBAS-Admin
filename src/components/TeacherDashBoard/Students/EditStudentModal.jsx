import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./AddStudentModal.css";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../config/supabaseClient";

const EditStudentModal = ({
  show,
  section,
  subject,
  getStudentsBySection,
  currentStudentNum,
  setCurrentStudentNum,
  currentStudentName,
  setCurrentStudentName,
  showEditModal,
  setShowEditModal,
}) => {
  const [newStudentNum, setNewStudentNum] = useState(currentStudentNum);
  const [newStudentName, setNewStudentName] = useState(currentStudentName);

  const handleSubmit = async (e) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("student_record")
        .update([
          {
            id: newStudentNum,
            name: newStudentName,
            section: section,
            subject: subject,
          },
        ])
        .eq("id", currentStudentNum)
        .eq("name", currentStudentName)
        .eq("subject", subject)
        .eq("section", section)
        .select();

      if (error) {
        if (error.code == 23505) throw new Error("Student already exist");

        throw new Error(error.message);
      }

      Swal.fire({
        title: "Success",
        text: "New Students in Class added successfully.",
        icon: "success",
        timer: 1500,
        timerProgressBar: true,
      });

      setShowEditModal(false);
      getStudentsBySection();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={show}
      >
        <Modal.Header closeButton onHide={() => setShowEditModal(false)}>
          <Modal.Title id="contained-modal-title-vcenter">
            Edit Student
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Student Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter student number"
                defaultValue={currentStudentNum}
                onChange={(e) => setNewStudentNum(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Student Name</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter student full name"
                defaultValue={currentStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleSubmit}>
            UPDATE
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditStudentModal;
