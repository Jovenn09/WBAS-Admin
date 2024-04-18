import React, { useState, useEffect } from "react";
import { utils, read } from "xlsx";
import "./AssignStudents.css";
import Form from "react-bootstrap/Form";
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

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);

  const [importedData, setImportedData] = useState([]);

  const fetchTeachers = async () => {
    let { data: teachers, error } = await supabaseAdmin
      .from("teachers")
      .select("*")
      .order("name", { ascending: true });

    if (error) console.error("Error fetching teachers:", error);
    setTeachers(teachers);
  };
  const fetchSubjects = async () => {
    let { data: subjects, error } = await supabaseAdmin
      .from("subjects")
      .select("*");

    if (error) console.error("Error fetching subjects:", error);

    setSubjects(subjects);
  };
  const fetchSections = async () => {
    let { data: sections, error } = await supabaseAdmin
      .from("sections")
      .select("*");

    if (error) console.error("Error fetching sections:", error);
    setSections(sections);
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
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
    if (!teacher || !subject || !section || !importedData.length) {
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

      const students = importedData.map((student) => ({
        id: student.student_id,
        name: student.name,
        subject: subject,
        section: section,
      }));

      const { error: err } = await supabaseAdmin
        .from("student_record")
        .insert(students);

      if (error) {
        Swal.fire("Error!", error.message, "error");
        return;
      }
      if (err) {
        Swal.fire("Error!", err.message, "error");
        return;
      }
      Swal.fire("Submitted!", "Students successfully added!.", "success");
    }
  };

  async function onImportHandler(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = read(data, { type: "arrayBuffer" });
      const sheetName = workbook.SheetNames[0]; // Assuming first sheet
      const sheet = workbook.Sheets[sheetName];
      const dataArray = utils.sheet_to_json(sheet, { header: 1 });

      // Filter out rows with all blank cells
      const filteredRows = dataArray.filter((row) =>
        row.some((cell) => cell !== null && cell !== "")
      );

      // Filter out columns with all blank cells
      const headerRow = filteredRows[0];
      const nonEmptyColumns = headerRow.map((_, colIndex) => {
        return filteredRows.some(
          (row) => row[colIndex] !== null && row[colIndex] !== ""
        );
      });
      const filteredColumns = filteredRows.map((row) =>
        row.filter((_, colIndex) => nonEmptyColumns[colIndex])
      );

      // Convert the filtered array of arrays to array of objects with key-value pairs
      const headerRowFiltered = headerRow.filter(
        (_, colIndex) => nonEmptyColumns[colIndex]
      );
      const dataObjects = filteredColumns.slice(1).map((row) => {
        const obj = {};
        headerRowFiltered.forEach((key, index) => {
          obj[key] = row[index];
        });
        return obj;
      });

      console.log("Converted data:", dataObjects);
      setImportedData(dataObjects);
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="assign-students-container">
      <h2>Assign Students</h2>
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
          <Form.Group
            style={{ width: "fit-content" }}
            controlId="formFile"
            className="mb-3"
          >
            <Form.Label>Import</Form.Label>
            <Form.Control
              type="file"
              accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={onImportHandler}
              required
            />
          </Form.Group>
        </div>
        <button type="submit">Submit</button>
      </form>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th></th>
            <th>Student ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {importedData.map((student, index) => (
            <tr key={student.student_id}>
              <td>{index + 1}</td>
              <td>{student.student_id}</td>
              <td>{student.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignStudents;
