import React, { useState, useEffect, useRef } from "react";
import { utils, read } from "xlsx";
import "./AssignStudents.css";
import Form from "react-bootstrap/Form";
import Swal from "sweetalert2";
import Select from "react-select";
import { supabaseAdmin } from "../../../config/supabaseClient";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FaTrash } from "react-icons/fa";
import AddStudentModal from "./modal/AddStudentModal";
import AddScheduleModal from "./modal/AddScheduleModal";
import { format, parse } from "date-fns";

function generateSchoolYearsArray() {
  const currentYear = new Date().getFullYear();
  const startYear = 2022;
  const yearsArray = [];

  for (let year = startYear; year <= currentYear; year++) {
    const nextYear = year + 1;
    const schoolYear = `${year.toString().substring(2)}${nextYear
      .toString()
      .substring(2)}`;
    yearsArray.push({ value: schoolYear, label: schoolYear });
  }

  yearsArray.sort((a, b) => b.value.localeCompare(a.value));

  return yearsArray;
}

function MyVerticallyCenteredModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      fullscreen
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Template for .CSV File
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Image</h4>
        <img src="/images/template.png" alt="" />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

const defaultObj = {
  teacher: "",
  subject: "",
  section: "",
  semester: "",
  schoolYear: "",
};

const AssignStudents = () => {
  const [formData, setFormData] = useState(defaultObj);

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);

  const [modalShow, setModalShow] = React.useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = React.useState(false);

  const [importedData, setImportedData] = useState([]);

  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const fileInputRef = useRef(null);

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

  const handleSemesterChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      semester: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSchoolYearChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      schoolYear: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { teacher, subject, section, semester, schoolYear } = formData;
    if (
      !teacher ||
      !subject ||
      !section ||
      !semester ||
      !importedData.length ||
      !schoolYear
    ) {
      return Swal.fire(
        "Please fill all fields and select at least one student",
        "",
        "error"
      );
    }

    // const { data } = await supabaseAdmin
    //   .from("assign")
    //   .select("*")
    //   .eq("subject_id", subject)
    //   .eq("section_id", section);

    // if (data.length > 0)
    //   return Swal.fire(
    //     "Error!",
    //     `${subject} has already been assigned to ${section}`,
    //     "error"
    //   );

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
      const { error } = await supabaseAdmin.from("assign").upsert({
        teacher_id: teacher,
        subject_id: subject,
        section_id: section,
        school_year: schoolYear,
        semester,
      });

      if (error) {
        Swal.fire("Error!", error.message, "error");
        return;
      }

      const students = importedData.map((student, index) => ({
        id: student.student_id,
        name: student.name,
        subject: subject,
        section: section,
        order: index + 1,
      }));

      console.log(students);

      const { error: err } = await supabaseAdmin
        .from("student_record")
        .upsert(students);

      // const sche = schedule.map((data) => ({
      //   day: data.day,
      //   start_time: data.startTime,
      //   end_time: data.endTime,
      //   subject,
      //   section,
      // }));

      // const { data, error: insertError } = await supabaseAdmin
      //   .from("schedule")
      //   .insert(sche)
      //   .select();

      if (err) {
        Swal.fire("Error!", err.message, "error");
        return;
      }

      Swal.fire("Submitted!", "Students successfully added!.", "success");
      window.location.reload();
    }
  };

  const [hasImport, setHasImport] = useState(false);
  async function onImportHandler(e) {
    const file = e.target.files[0];

    console.log(file);
    if (!file) return;

    setHasImport(true);
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

      console.log(dataObjects);

      setImportedData((prev) => prev.concat(dataObjects));
    };

    reader.readAsArrayBuffer(file);
  }

  const format24HourTo12Hour = (time24) => {
    const date = parse(time24, "HH:mm", new Date());

    return format(date, "hh:mm aa");
  };

  return (
    <div className="assign-students-container">
      <h2 className="mb-5">Assign</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="assign-students-label" style={{ width: "200px" }}>
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
          <label className="assign-students-label" style={{ width: "200px" }}>
            Select Subject:
            <Select
              value={subjects.find(
                (subject) => subject.value === formData.subject
              )}
              onChange={handleSubjectChange}
              options={subjects.map((subject) => ({
                value: subject.subject_code,
                label: `${subject.subject_code} - ${subject.subject_description}`,
              }))}
              required
            />
          </label>
          <label className="assign-students-label" style={{ width: "200px" }}>
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
          <label className="assign-students-label" style={{ width: "200px" }}>
            Semester:
            <Select
              value={sections.find(
                (section) => section.value === formData.section
              )}
              onChange={handleSemesterChange}
              options={[
                { value: "first semester", label: "First Semester" },
                { value: "second semester", label: "Second Semester" },
                { value: "summer", label: "Summer" },
              ]}
              required
            />
          </label>
          <label className="assign-students-label" style={{ width: "200px" }}>
            Year:
            <Select
              value={sections.find(
                (section) => section.value === formData.schoolYear
              )}
              onChange={handleSchoolYearChange}
              options={generateSchoolYearsArray()}
              required
            />
          </label>
          {/* <div className="my-3 d-flex gap-2">
            <button type="button" onClick={() => setShowAddScheduleModal(true)}>
              Add Schedule
            </button>
            <div
              style={{
                backgroundColor: "white",
                width: "300px",
                borderRadius: "12px",
                border: "1px solid black",
                overflow: "auto",
                height: "50px",
                paddingInline: "4px",
              }}
            >
              {schedule.map((obj, index) => (
                <p className="m-0" key={index}>
                  <span style={{ textTransform: "capitalize" }}>{obj.day}</span>
                  , {format24HourTo12Hour(obj.startTime)}{" "}
                  {format24HourTo12Hour(obj.endTime)}{" "}
                  <span
                    style={{
                      fontWeight: "bolder",
                    }}
                  >
                    -
                  </span>
                </p>
              ))}
            </div>
          </div> */}
          <div className="d-flex gap-2 align-items-center flex-wrap mb-5">
            <Form.Group
              style={{ width: "fit-content" }}
              controlId="formFile"
              className="mb-3"
            >
              <Form.Label>Import</Form.Label>
              <Form.Control
                ref={fileInputRef}
                type="file"
                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={onImportHandler}
                disabled={hasImport}
              />
            </Form.Group>
            <button
              type="button"
              style={{
                backgroundColor: "darkblue",
                marginTop: "12px",
                borderRadius: "15px",
              }}
              onClick={() => setModalShow(true)}
            >
              Show Template
            </button>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          {importedData.length !== 0 && (
            <p>
              Students: <strong>{importedData.length} </strong>
            </p>
          )}
          <button
            type="button"
            className="ms-auto"
            onClick={() => setShowAddStudentModal(true)}
          >
            Add Student
          </button>
        </div>
        <table className="table table-bordered">
          <thead className="thead-dark">
            <tr>
              <th></th>
              <th>Student ID</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {importedData.map((student, index) => (
              <tr key={student.student_id}>
                <td>{index + 1}</td>
                <td>{student.student_id}</td>
                <td>{student.name}</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() =>
                      setImportedData((prev) =>
                        prev.filter(
                          ({ student_id }) => student_id !== student.student_id
                        )
                      )
                    }
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
        />
        <div className="d-flex justify-content-between">
          <button type="submit">Assign</button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Clear the file input value
              }
              setImportedData([]);
              setHasImport(false);
              setSchedule([]);
            }}
          >
            Reset
          </Button>
        </div>
      </form>
      <AddStudentModal
        show={showAddStudentModal}
        closeModal={() => setShowAddStudentModal(false)}
        setData={setImportedData}
        data={importedData}
      />
      {/* <AddScheduleModal
        show={showAddScheduleModal}
        handleClose={() => setShowAddScheduleModal(false)}
        setData={setSchedule}
        day={day}
        setDay={setDay}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
      /> */}
    </div>
  );
};

export default AssignStudents;
