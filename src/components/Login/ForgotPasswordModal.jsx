import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import supabase from "../../config/supabaseClient";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ForgotPasswordModal = ({ show, handleClose }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleForgotPassword = async () => {
    try {
      setIsLoading(true);

      if (!email || !emailRegex.test(email)) {
        throw new Error("Invalid Email");
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://redirect-ats.vercel.app",
      });
      if (error) throw new Error(error.message);

      setEmail("");
      handleClose();
      Swal.fire({
        icon: "success",
        title: "Please check your email",
        timer: 1500,
        timerProgressBar: true,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.message,
        timer: 1500,
        timerProgressBar: true,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    } finally {
      setIsLoading(false);
    }
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Forgot Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={handleEmailChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={isLoading}
          variant="primary"
          onClick={handleForgotPassword}
        >
          {isLoading ? "Sending..." : "Send Reset Email"}
        </Button>
        <Button disabled={isLoading} variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ForgotPasswordModal;
