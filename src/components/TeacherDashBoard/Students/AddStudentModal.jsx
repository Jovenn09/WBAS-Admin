import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./AddStudentModal.css";
import axios from "axios";
import Swal from "sweetalert2";

const AddStudentModal = ({ show, onClose, onSave, newStudent }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [studentUserId, setStudentUserId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const teacherId = sessionStorage.getItem("user_id");

  useEffect(() => {
    // axios.get(`http://localhost:8081/students`)
    //   .then((response) => {
    //     setStudents(response.data);
    //   })
    //   .catch((error) => {
    //     console.error('Error fetching students:', error);
    //   });
  }, []);

  const studentOptions = students.map((student) => ({
    value: student.user_id,
    label: student.name,
  }));

  const handleSelectedStudentsChange = (selectedOptions) => {
    setSelectedStudents(selectedOptions);
  };

  useEffect(() => {
    // axios
    //   .get(`http://localhost:8081/teacher-subjects?teacherId=${teacherId}`)
    //   .then((response) => {
    //     setSubjects(response.data);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching teacher subjects:", error);
    //   });
  }, []);

  const handleClassChange = (selectedOptions) => {
    setSelectedClass(selectedOptions);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // const userId = sessionStorage.getItem("user_id");
    // const selectedStudentIds = selectedStudents.map((student) => student.value);
    // const selectedBlock = e.target.blocks.value;
    // const selectedClasses = Array.isArray(selectedClass)
    //   ? selectedClass.map((classOption) => classOption.value)
    //   : [selectedClass.value];

    // const insertionPromises = [];

    // for (const studentId of selectedStudentIds) {
    //   for (const classId of selectedClasses) {
    //     const data = {
    //       teacher_id: userId,
    //       studentId,
    //       block: selectedBlock,
    //       selectedClass: classId,
    //     };

    //     insertionPromises.push(
    //       axios.post("http://localhost:8081/insert-student", data)
    //     );
    //   }
    // }

    // try {
    //   const results = await Promise.all(insertionPromises);

    //   const studentExists = results.some(
    //     (result) => result.data.message === "Student already exists"
    //   ); // Check for the specific message

    //   if (studentExists) {
    //     Swal.fire({
    //       title: "Error",
    //       text: "Student already exists.",
    //       icon: "error",
    //     });
    //   } else {
    //     Swal.fire({
    //       title: "Success",
    //       text: "New Students in Class added successfully.",
    //       icon: "success",
    //       timer: 1500,
    //       timerProgressBar: true,
    //       didClose: () => {
    //         window.location.reload();
    //       },
    //     });
    //   }
    // } catch (error) {
    //   console.error("Error inserting students:", error);
    //   Swal.fire({
    //     title: "Error",
    //     text: "An error occurred while inserting students.",
    //     icon: "error",
    //   });
    // }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit}>
        <div className="add-student-modal">
          <h2>Add Student</h2>
          <div className="search-results">
            <label>
              Name:
              <Select
                isMulti
                value={selectedStudents}
                onChange={handleSelectedStudentsChange}
                options={students.map((student) => ({
                  value: student.user_id,
                  label: student.name,
                }))}
              />
            </label>
          </div>

          <div className="search-results">
            <label>
              Section:
              <select name="blocks">
                <option value="">UP-FC1-BSIT3-WEBDEV2</option>
                <option value="">UP-FC1-BSIT3-WEBDEV5</option>
              </select>
            </label>
          </div>
          <label>
            Class:
            <Select
              isMulti
              name="classes"
              value={selectedClass}
              onChange={handleClassChange}
              options={subjects.map((subject) => ({
                value: subject.id,
                label: subject.subject_name,
              }))}
            />
          </label>
          <div className="modal-buttons">
            <button type="submit">Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStudentModal;
