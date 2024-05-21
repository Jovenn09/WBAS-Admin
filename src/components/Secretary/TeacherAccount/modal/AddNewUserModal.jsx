import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import randomstring from "randomstring";
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

const AddNewUserModal = ({ show, closeModal }) => {
  const role = "Instructor";

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState("");

  const handleSubmit = async () => {
    const userData = {
      name: `${name} ${lastName}`,
      role: role,
      email: email,
      password: password,
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
        user_metadata: { access: "instructor" },
      });

    if (authError) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: authError.message,
      });
      return;
    }

    delete userData.password;
    const { error: insertError } = await supabaseAdmin
      .from("teachers")
      .insert({ uuid: data.user.id, ...userData });

    if (insertError) return console.error("Error adding teacher data");

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Account created successfully.",
    });
    closeModal();

    const sendEmail = await fetch(
      "https://wbas-server.onrender.com/send-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const json = await sendEmail.json();

    if (sendEmail.ok) {
      console.log("Email sent successfully!", json);
    } else {
      console.error("Failed to send email:", json);
    }
  };

  useEffect(() => {
    setName("");
    setLastName("");
    setEmail("");
    setPassword("");
  }, [closeModal]);

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="First Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Form.Control
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </Form.Group>
          <Form.Group controlId="formRole">
            <Form.Label>Role</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter role"
              value={role}
              readOnly
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group style={{ position: "relative" }} controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
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
          onClick={() => setPassword(`${lastName}-${randomstring.generate(5)}`)}
          disabled={!lastName}
        >
          Generate password
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit}>
          Add User
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddNewUserModal;
