import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { supabaseAdmin } from "../../../config/supabaseClient";
import Swal from "sweetalert2";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

const EditStudentModal = ({
  show,
  closeModal,
  studentId,
  fetchStudentData,
}) => {
  const [editStudentData, setEditStudentData] = useState({
    name: "",
    email: "",
    course: "",
    year_level: "",
    sections: [],
    subjects: [],
    address: "",
    contact_number: "",
    student_id: "",
    admission_status: "regular",
  });

  const [sections, setSections] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [sectionOption, setSectionOption] = useState([]);
  const [subjectOption, setSubjectOption] = useState([]);

  const [defaultSections, setDefaultSections] = useState([]);
  const [defaultSubjects, setDefaultSubjects] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      const sections = await supabaseAdmin.from("sections").select("*");
      const subjects = await supabaseAdmin.from("subjects").select("*");

      if (sections.error) console.error(sections.error);

      const subjectOptions = subjects.data.map((data) => ({
        value: data.subject_code,
        label: `${data.subject_code} - ${data.subject_description}`,
      }));

      const sectionOptions = sections.data.map((data) => ({
        value: data.section_code,
        label: data.section_code,
      }));

      setSubjectOption(subjectOptions);
      setSectionOption(sectionOptions);

      const { data, error } = await supabaseAdmin
        .from("students")
        .select("*")
        .eq("uuid", studentId);

      if (error) return console.error(`Error ${error}`);
      setEditStudentData(data[0]);

      setDefaultSubjects(
        subjectOptions.filter((subject) =>
          data[0].subjects.includes(subject.value)
        )
      );

      setDefaultSections(
        sectionOptions.filter((section) =>
          data[0].sections.includes(section.value)
        )
      );
    };
    if (studentId) {
      fetchStudentData();
    }
  }, [show, studentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditStudentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!sections.length || !selectedSubjects.length) {
      alert("Please fill all the required field");
      return;
    }

    editStudentData.sections = sections.map((data) => data.value);
    editStudentData.subjects = selectedSubjects.map((data) => data.value);

    const { data, error: updateUserError } =
      await supabaseAdmin.auth.admin.updateUserById(studentId, {
        email: editStudentData.email,
      });

    if (updateUserError) return console.error(`Error: ${updateUserError}`);

    const { error } = await supabaseAdmin
      .from("students")
      .update(editStudentData)
      .eq("uuid", studentId);

    if (error) return alert(`Error occur: ${error}`);
    fetchStudentData();
    closeModal();
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Account updated successfully.",
    });
  };

  useEffect(() => {
    setSections(defaultSections);
  }, [defaultSections]);

  useEffect(() => {
    setSelectedSubjects(defaultSubjects);
  }, [defaultSubjects]);

  // useEffect(() => {
  //   console.log(JSON.stringify(editStudentData, null, 2));
  // }, [editStudentData]);

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="forStudentId">
            <Form.Label>Student Id</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Student Id"
              name="student_id"
              value={editStudentData.student_id}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="forName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Name"
              name="name"
              value={editStudentData.name}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="forEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Email"
              name="email"
              value={editStudentData.email}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formAdmissionStatus">
            <Form.Label>Admission Status</Form.Label>
            <Form.Select
              value={editStudentData.admission_status}
              onChange={handleChange}
              name="admission_status"
            >
              <option value="regular">Regular</option>
              <option value="irregular">Irregular</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="forCourse">
            <Form.Label>Course</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Course"
              name="course"
              value={editStudentData.course}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formYearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Select
              value={editStudentData.year_level}
              defaultValue={editStudentData.year_level}
              onChange={(e) =>
                handleChange({
                  target: { name: "year_level", value: e.target.value },
                })
              }
            >
              <option value="1st Year College">1st Year College</option>
              <option value="2nd Year College">2nd Year College</option>
              <option value="3rd Year College">3rd Year College</option>
              <option value="4th Year College">4th Year College</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="formSubjects">
            <Form.Label>Section</Form.Label>
            <Select
              defaultValue={defaultSections}
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={sectionOption}
              onChange={(value) => setSections(value)}
            />
          </Form.Group>
          <Form.Group controlId="formSubjects">
            <Form.Label>Subjects</Form.Label>
            <Select
              defaultValue={defaultSubjects}
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={subjectOption}
              onChange={(value) => setSelectedSubjects(value)}
            />
          </Form.Group>
          <Form.Group controlId="forAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Address"
              name="address"
              value={editStudentData.address}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="forContactNumber">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Contact Number"
              name="contact_number"
              value={editStudentData.contact_number}
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

export default EditStudentModal;
