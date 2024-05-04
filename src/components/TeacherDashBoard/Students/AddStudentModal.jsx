import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./AddStudentModal.css";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../config/supabaseClient";

const defaultStudentIdObj = {
  deptCode: "",
  year: "",
  sequence: "",
};

const AddStudentModal = ({
  show,
  onClose,
  section,
  subject,
  getStudentsBySection,
}) => {
  const [studentName, setStudentName] = useState("");
  const [studentNumber, setStudentNumber] = useState(defaultStudentIdObj);

  function onChangeStudentNumHandler(key, e) {
    const value = e.target.value;

    if (isNaN(Number(value))) return;

    let regExp = /^\d{0,2}$/;

    switch (key) {
      case "deptCode":
        break;
      case "year":
        regExp = /^\d{0,4}$/;
        break;
      case "sequence":
        regExp = /^\d{0,5}$/;
        break;
    }

    if (regExp.test(value)) {
      setStudentNumber((prev) => ({ ...prev, [key]: value }));
    }
  }

  function onChangeStudentNameHandler(e) {
    const value = e.target.value;

    if (!/\d/.test(value)) {
      setStudentName(value.toUpperCase());
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { deptCode, year, sequence } = studentNumber;
    const student_id = `${deptCode}-${year}-${sequence}`;

    try {
      const { data, error } = await supabaseAdmin
        .from("student_record")
        .insert([
          {
            id: student_id,
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

  useEffect(() => {
    setStudentNumber(defaultStudentIdObj);
    setStudentName("");
  }, [onClose]);

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
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Student Number</Form.Label>
              <div className="d-flex gap-2 w-50 align-items-center">
                <Form.Control
                  value={studentNumber.deptCode}
                  className="w-25"
                  type="text"
                  placeholder="00"
                  onChange={onChangeStudentNumHandler.bind(this, "deptCode")}
                  pattern="\d{2}"
                  required
                />
                <span className="fw-bolder">-</span>
                <Form.Control
                  className="w-50"
                  type="text"
                  value={studentNumber.year}
                  placeholder="0000"
                  onChange={onChangeStudentNumHandler.bind(this, "year")}
                  pattern="\d{4}"
                  required
                />
                <span className="fw-bolder">-</span>
                <Form.Control
                  className="w-75"
                  type="text"
                  value={studentNumber.sequence}
                  placeholder="00000"
                  pattern="\d{5}"
                  onChange={onChangeStudentNumHandler.bind(this, "sequence")}
                  required
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Student Name</Form.Label>
              <Form.Control
                className="w-50"
                type="text"
                value={studentName}
                placeholder="Enter student full name"
                onChange={onChangeStudentNameHandler}
                maxLength={55}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              // disabled={!(!!studentName && !!studentNumber)}
              variant="success"
            >
              ADD
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AddStudentModal;
