import Modal from "react-bootstrap/Modal";
// import supabase from "../../config/supabaseClient";
// import { useContext, useEffect, useState } from "react";
// import { useHistory } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext";

export default function VerifyEmail({
  email,
  showModal,
  setShowModal,
  metadata,
}) {
  return (
    <Modal
      show={showModal}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Email Verification
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          We've sent you an email to verify your email address. You will be
          redirect to the home page after confirmation. you can close this
          window after you redirected
        </p>
      </Modal.Body>
    </Modal>
  );
}
