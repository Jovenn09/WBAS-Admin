import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./SelectStudentModal.css";
import axios from "axios";

const SelectStudentModal = ({
  showModal,
  onCloseModal,
  updateSelectedStudents,
}) => {
  const [studentOptions, setStudentOptions] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/register/getAll"
        );
        const students = response.data.map((student) => ({
          value: student.student_id,
          label: `${student.name} - ${student.student_id}`,
        }));
        setStudentOptions(students);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  const handleSelect = (selectedOptions) => {
    updateSelectedStudents(selectedOptions);
  };

  return (
    showModal && (
      <div className="modal-select">
        <div className="modal-content-select">
          <span className="close" onClick={onCloseModal}>
            &times;
          </span>
          <h2>Select Students</h2>

          <Select
            options={studentOptions}
            isMulti
            closeMenuOnSelect={false}
            onChange={handleSelect}
          />

          <button className="add-students" onClick={onCloseModal}>
            Add Students
          </button>
        </div>
      </div>
    )
  );
};

export default SelectStudentModal;
