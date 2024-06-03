import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const iconStyle = {
  position: "absolute",
  top: "32px",
  bottom: "0",
  right: "12",
  margin: "auto",
  cursor: "pointer",
};

const defaultStudentIdObj = {
  deptCode: "",
  year: "",
  sequence: "",
};

const AddStudentModal = ({ show, closeModal, setData, data }) => {
  const [name, setName] = useState("");
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
        regExp = /^\d{0,6}$/;
        break;
    }

    if (regExp.test(value)) {
      setStudentNumber((prev) => ({ ...prev, [key]: value }));
    }
  }

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add Student</Modal.Title>
      </Modal.Header>
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          const { deptCode, year, sequence } = studentNumber;
          const student_id = `${deptCode}-${year}-${sequence}`;

          const studentIDs = data.map(({ student_id }) => student_id);

          if (studentIDs.includes(student_id))
            return alert("student ID is already taken");

          setData((prev) => prev.concat([{ student_id, name }]));
          setStudentNumber(defaultStudentIdObj);
          setName("");
          closeModal();
        }}
      >
        <Modal.Body>
          <Form.Group controlId="formStudentId">
            <Form.Label>Student Number</Form.Label>
            <div className="d-flex gap-2 w-100 align-items-center">
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
                pattern="\d{5,6}"
                onChange={onChangeStudentNumHandler.bind(this, "sequence")}
                required
              />
            </div>
          </Form.Group>
          <Form.Group controlId="formName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="(Last Name), (First Name) (Middle Name)"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="primary">
            Add Student
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setStudentNumber("");
              setName("");
              closeModal();
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddStudentModal;
