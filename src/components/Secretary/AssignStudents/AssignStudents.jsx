import React, { useState, useEffect } from "react";
import "./AssignStudents.css";
import SelectStudentModal from "../SelectStudent/SelectStudentModal";
import { FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import Select from "react-select";
import { supabaseAdmin } from "../../../config/supabaseClient";

function getSchoolYear() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const startMonth = 6;
  const endMonth = 2;

  if (currentMonth >= startMonth && currentMonth <= endMonth) {
    const nextYearShort = String(currentYear + 1).slice(-2);
    return `${String(currentYear).slice(-2)}${nextYearShort}`;
  } else {
    const lastYearShort = String(currentYear - 1).slice(-2);
    return `${lastYearShort}${String(currentYear).slice(-2)}`;
  }
}

const AssignStudents = () => {
  const [formData, setFormData] = useState({
    teacher: "",
    subject: "",
    section: "",
  });

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      let { data: teachers, error } = await supabaseAdmin
        .from("teachers")
        .select("*")
        .order("name", { ascending: true });

      if (error) console.error("Error fetching teachers:", error);
      setTeachers(teachers);
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      let { data: subjects, error } = await supabaseAdmin
        .from("subjects")
        .select("*");

      if (error) console.error("Error fetching subjects:", error);

      setSubjects(subjects);
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      let { data: sections, error } = await supabaseAdmin
        .from("sections")
        .select("*");

      if (error) console.error("Error fetching sections:", error);
      setSections(sections);
    };
    fetchSections();
  }, []);

  const handleTeacherChange = (selectedOption) => {
    setFormData({
      ...formData,
      teacher: selectedOption ? selectedOption.value : "",
    });
  };

  const handleSubjectChange = (selectedOption) => {
    setFormData({
      ...formData,
      subject: selectedOption ? selectedOption.value : "",
    });
  };

  const handleSectionChange = (selectedOption) => {
    setFormData({
      ...formData,
      section: selectedOption ? selectedOption.value : "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(formData);
    const { teacher, subject, section } = formData;
    if (!teacher || !subject || !section) {
      return Swal.fire(
        "Please fill all fields and select at least one student",
        "",
        "error"
      );
    }
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to add these students?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, submit it!",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });
    if (confirmResult.isConfirmed) {
      const { error } = await supabaseAdmin.from("assign").insert({
        teacher_id: teacher,
        subject_id: subject,
        section_id: section,
        school_year: getSchoolYear(),
      });

      if (error) {
        Swal.fire(
          "Error!",
          "Failed to assign teacher. Please try again later.",
          "error"
        );
        return;
      }
      Swal.fire("Submitted!", "Students successfully added!.", "success");
    }
  };

  const handleSelectStudents = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const updateSelectedStudents = (selectedOptions) => {
    setSelectedStudents(selectedOptions);
  };

  const handleRemoveStudent = (indexToRemove) => {
    setSelectedStudents((prevStudents) =>
      prevStudents.filter((student, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="assign-students-container">
      <h2>Assign Section to Instructor</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="assign-students-label">
            Select Instructor:
            <Select
              value={teachers.find(
                (teacher) => teacher.value === formData.teacher
              )}
              onChange={handleTeacherChange}
              options={teachers.map((teacher) => ({
                value: teacher.uuid,
                label: teacher.name,
              }))}
              required
            />
          </label>
          <label className="assign-students-label">
            Select Subject:
            <Select
              value={subjects.find(
                (subject) => subject.value === formData.subject
              )}
              onChange={handleSubjectChange}
              options={subjects.map((subject) => ({
                value: subject.subject_code,
                label: subject.subject_description,
              }))}
              required
            />
          </label>
          <label className="assign-students-label">
            Section:
            <Select
              value={sections.find(
                (section) => section.value === formData.section
              )}
              onChange={handleSectionChange}
              options={sections.map((section) => ({
                value: section.section_code,
                label: section.section_code,
              }))}
              required
            />
          </label>
        </div>
        {/* <div>
          <button
            type="button"
            className="select-students"
            onClick={handleSelectStudents}
          >
            Select Students
          </button>
          <SelectStudentModal
            showModal={showModal}
            onCloseModal={handleCloseModal}
            updateSelectedStudents={updateSelectedStudents}
          />
        </div> */}
        {selectedStudents.length > 0 && (
          <div>
            <h3>Selected Students</h3>
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.value}</td>
                    <td>{student.label.split(" (")[0]}</td>
                    <td>
                      <button
                        className="remove-button"
                        onClick={() => handleRemoveStudent(index)}
                      >
                        <FaTimes className="red-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button type="submit">Submit</button>
      </form>
      {/* <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Student ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {importedData.map((student) => (
            <tr key={student.student_id}>
              <td>{student.student_id}</td>
              <td>{student.name}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  );
};

export default AssignStudents;
