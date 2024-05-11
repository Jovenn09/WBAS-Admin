import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import randomstring from "randomstring";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { supabaseAdmin } from "../../../../config/supabaseClient";

const iconStyle = {
  position: "absolute",
  top: "32px",
  bottom: "0",
  right: "12",
  margin: "auto",
  cursor: "pointer",
};

const phinmaEmail = /^[a-zA-Z0-9._%+-]+\.up@phinmaed\.com$/;

const defaultStudentIdObj = {
  deptCode: "",
  year: "",
  sequence: "",
};

const AddStudentModal = ({ show, closeModal }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [studentNumber, setStudentNumber] = useState(defaultStudentIdObj);
  const [showPassword, setShowPassword] = useState("");

  const [admissionStatus, setAdmissionStatus] = useState("regular");

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

  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !course || !yearLevel || !password) {
      return alert("Please fill all required fields");
    }

    const { deptCode, year, sequence } = studentNumber;

    const studentData = {
      name: name,
      email: email,
      course: course,
      year_level: yearLevel,
      address: address,
      contact_number: contactNumber,
      password: password,
      student_id: `${deptCode}-${year}-${sequence}`,
      admission_status: admissionStatus,
    };

    if (!phinmaEmail.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please use phinma email",
      });
      return;
    }

    const { data, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { access: "student" },
      });

    if (authError) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: authError.message,
      });
      return;
    }

    delete studentData.password;
    const { error: insertError } = await supabaseAdmin
      .from("students")
      .insert({ uuid: data.user.id, ...studentData });

    if (insertError) {
      supabaseAdmin.auth.admin.deleteUser(data.user.id);
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
      text: "Creating Student Account Successful!",
    });

    closeModal();
  };

  useEffect(() => {
    const getSection = async () => {
      let { data: sections, error } = await supabaseAdmin
        .from("sections")
        .select("*");

      let { data: subjects, error: subjectError } = await supabaseAdmin
        .from("subjects")
        .select("*");

      if (error) return console.error(error);
      if (error) return console.error(subjectError);
    };
    getSection();
  }, [show, closeModal]);

  useEffect(() => {
    setName("");
    setEmail("");
    setCourse("");
    setAddress("");
    setContactNumber("");
    setPassword("");
    setYearLevel("");
    setStudentNumber(defaultStudentIdObj);
  }, [closeModal]);

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add Student Account</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleStudentSubmit}>
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
                pattern="\d{5}"
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
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="formYearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Select
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              required
            >
              <option value="">Select Year Level</option>
              <option value="1st Year College">1st Year College</option>
              <option value="2nd Year College">2nd Year College</option>
              <option value="3rd Year College">3rd Year College</option>
              <option value="4th Year College">4th Year College</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="formCourse">
            <Form.Label>Course</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="formAdmissionStatus">
            <Form.Label>Admission Status</Form.Label>
            <Form.Select
              value={admissionStatus}
              onChange={(e) => setAdmissionStatus(e.target.value)}
              required
            >
              <option value="regular">Regular</option>
              <option value="irregular">Irregular</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="formAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formContactNumber">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group style={{ position: "relative" }} controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {showPassword ? (
              <BsEyeSlashFill
                onClick={() => setShowPassword(false)}
                style={iconStyle}
                size={"25px"}
              />
            ) : (
              <BsEyeFill
                style={iconStyle}
                size={"25px"}
                onClick={() => setShowPassword(true)}
              />
            )}
          </Form.Group>
          <Button
            style={{ marginTop: "1rem" }}
            onClick={() =>
              setPassword(`${name.split(" ")[0]}-${randomstring.generate(5)}`)
            }
            disabled={!name}
          >
            Generate password
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="primary">
            Add Student Account
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddStudentModal;
