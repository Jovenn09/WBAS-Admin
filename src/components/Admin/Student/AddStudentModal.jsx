import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../config/supabaseClient";
import randomstring from "randomstring";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";

const iconStyle = {
  position: "absolute",
  top: "32px",
  bottom: "0",
  right: "12",
  margin: "auto",
  cursor: "pointer",
};

const phinmaEmail = /^[a-zA-Z0-9._%+-]+\.up@phinmaed\.com$/;

const AddStudentModal = ({ show, closeModal }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [showPassword, setShowPassword] = useState("");

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [section, setSection] = useState([]);

  const [admissionStatus, setAdmissionStatus] = useState("regular");

  const handleStudentSubmit = async () => {
    if (
      !section.length ||
      !selectedSubjects.length ||
      !name ||
      !email ||
      !course ||
      !yearLevel ||
      !password ||
      !studentId
    ) {
      return alert("Please fill all required fields");
    }

    const studentData = {
      name: name,
      email: email,
      course: course,
      year_level: yearLevel,
      address: address,
      contact_number: contactNumber,
      password: password,
      student_id: studentId,
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
    setStudentId("");
    setYearLevel("");
    setSection([]);
    setSelectedSubjects([]);
  }, [closeModal]);

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add Student Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formStudentId">
            <Form.Label>Student Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Student Number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formYearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Select
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
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
            />
          </Form.Group>
          <Form.Group controlId="formAdmissionStatus">
            <Form.Label>Admission Status</Form.Label>
            <Form.Select
              value={admissionStatus}
              onChange={(e) => setAdmissionStatus(e.target.value)}
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
            />
          </Form.Group>

          <Form.Group controlId="formContactNumber">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </Form.Group>
          <Form.Group style={{ position: "relative" }} controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </Form>
        <Button
          style={{ marginTop: "1rem" }}
          onClick={() => setPassword(randomstring.generate(16))}
        >
          Generate password
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleStudentSubmit}>
          Add Student Account
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddStudentModal;
