import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./AddStudentModal.css";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../config/supabaseClient";

const AddStudentModal = ({
  show,
  onClose,
  section,
  subject,
  getStudentsBySection,
}) => {
  const [studentName, setStudentName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");

  const handleSubmit = async (e) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("student_record")
        .insert([
          {
            id: studentNumber,
            name: studentName,
            section: section,
            subject: subject,
          },
        ])
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
      onClose();

      setStudentName("");
      setStudentNumber("");
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
        <Modal.Header closeButton onHide={onClose}>
          <Modal.Title id="contained-modal-title-vcenter">
            Add Student
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Student Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter student number"
                onChange={(e) => setStudentNumber(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Student Name</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter student full name"
                onChange={(e) => setStudentName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={!(!!studentName && !!studentNumber)}
            variant="success"
            onClick={handleSubmit}
          >
            ADD
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddStudentModal;
