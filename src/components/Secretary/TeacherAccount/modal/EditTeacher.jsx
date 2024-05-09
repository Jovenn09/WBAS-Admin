import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { supabaseAdmin } from "../../../../config/supabaseClient";

const EditTeacherModal = ({
  show,
  closeModal,
  teacherId,
  fetchTeachersData,
}) => {
  const [loading, setLoading] = useState(false);
  const [editedTeacherData, setEditedTeacherData] = useState({
    name: "",
    role: "",
    email: "",
  });

  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      const { data, error } = await supabaseAdmin
        .from("teachers")
        .select("*")
        .eq("uuid", teacherId);

      if (error) return console.error(`Error ${error}`);
      setEditedTeacherData(data[0]);
      setLoading(false);
      console.log(data);
    };
    if (teacherId) {
      fetchTeacherData();
    }
  }, [show, teacherId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTeacherData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { data, error: updateUserError } =
      await supabaseAdmin.auth.admin.updateUserById(teacherId, {
        email: editedTeacherData.email,
      });

    if (updateUserError) return console.error(`Error: ${updateUserError}`);

    const { error } = await supabaseAdmin
      .from("teachers")
      .update(editedTeacherData)
      .eq("uuid", teacherId);

    if (error) return console.error(`Error occur: ${error}`);
    fetchTeachersData();
    closeModal();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Account updated successfully.",
    });
  };

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Teacher</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              name="name"
              value={loading ? "" : editedTeacherData.name}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="email"
              value={editedTeacherData.email}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formRole">
            <Form.Label>Role</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter role"
              name="role"
              value={editedTeacherData.role}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
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

export default EditTeacherModal;
