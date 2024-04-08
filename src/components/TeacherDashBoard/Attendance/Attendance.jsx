import React, { useState, useEffect, useContext } from "react";
import { Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Attendance.css";
import Swal from "sweetalert2";
import supabase from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";

const Attendance = () => {
  const { user } = useContext(AuthContext);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedSection, setSelectedSection] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSection] = useState([]);

  const [absentStudents, setAbsentStudents] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [activePage, setActivePage] = useState(1);

  const itemsPerPage = 10;

  async function getHandleClass() {
    const { data, error } = await supabase
      .from("assign")
      .select(
        `
      subject_id,
      subjects (
        subject_description
      )
      `
      )
      .eq("teacher_id", user.id);

    const subjects = data.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.subject_id === item.subject_id)
    );

    setSubjects(subjects);
  }

  async function getSections() {
    const { data, error } = await supabase
      .from("assign")
      .select("section_id")
      .eq("teacher_id", user.id)
      .eq("subject_id", selectedClass);

    if (error) console.log(error);

    const sections = data.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.section_id === item.section_id)
    );
    setSection(sections);
  }

  useEffect(() => {
    if (selectedClass !== "") {
      getSections();
    }
  }, [selectedClass]);

  useEffect(() => {
    setSelectedSection("");
    setStudents([]);
  }, [selectedClass]);

  useEffect(() => {
    getHandleClass();
  }, []);

  async function showStudents() {
    const students = await supabase
      .from("students")
      .select("*", { count: "exact" })
      .order("name", { ascending: true })
      .contains("subjects", [selectedClass])
      .contains("sections", [selectedSection]);

    setStudents(students.data);

    setTotalStudents(students.count);

    const defaultAttendance = students.data.map((student) => ({
      teacher_id: user.id,
      student_id: student.uuid,
      subject_id: selectedClass,
      section_id: selectedSection,
      date: selectedDate,
      attendance_status: "present",
    }));

    setStudentAttendance(defaultAttendance);
  }

  async function paginateStudents() {
    const start = (activePage - 1) * itemsPerPage;
    const end = activePage * itemsPerPage - 1;

    const students = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true })
      .contains("subjects", [selectedClass])
      .contains("sections", [selectedSection])
      .range(start, end);

    setStudents(students.data);
  }

  useEffect(() => {
    if (students.length !== 0) {
      paginateStudents();
    }
  }, [activePage]);

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const handleAttendanceStatusChange = (studentId, status) => {
    if (status === "Absent") {
      setAbsentStudents((prev) =>
        prev.includes(studentId) ? prev : [...prev, studentId]
      );
      return;
    }

    setAbsentStudents((prev) => prev.filter((id) => id !== studentId));
  };

  const submitAttendance = async (e) => {
    e.preventDefault();

    const currentDate = new Date();
    const selectedAttendanceDate = new Date(selectedDate);

    if (selectedAttendanceDate > currentDate) {
      Swal.fire({
        title: "Error!",
        text: "You cannot take attendance for a future date",
        icon: "error",
        timer: 1500,
        timerProgressBar: true,
      });
      return;
    }

    if (!selectedSection || !selectedDate || !selectedClass) {
      Swal.fire({
        title: "Error!",
        text: "Please select required fields",
        icon: "error",
        timer: 1000,
        timerProgressBar: true,
      });
    }

    const attendanceRecord = studentAttendance.map((data) =>
      absentStudents.includes(data.student_id)
        ? { ...data, attendance_status: "absent", date: selectedDate }
        : { ...data, date: selectedDate }
    );

    if (attendanceRecord.length === 0) return;

    const { error } = await supabase
      .from("attendance")
      .upsert(attendanceRecord);

    if (error) {
      Swal.fire({
        title: "Error!",
        text: error.details,
        icon: "error",
      });
      console.log(error.message);
      return;
    }

    setSelectedClass("");
    setSelectedSection("");
    setStudents([]);

    Swal.fire({
      title: "Submitted!",
      text: "Attendance Submitted",
      icon: "success",
    });

    // const attendanceData = {
    //   teacherID: teacherId,
    //   selectedClass: selectedClass,
    //   selectedDate: selectedDate,
    //   studentData: students
    //     .filter((student) => attendanceStatus[student.user_id])
    //     .map((student) => ({
    //       user_id: student.user_id,
    //       attendance: attendanceStatus[student.user_id],
    //     })),
    // };

    // axios
    //   .post("http://localhost:8081/submit-attendance", attendanceData)
    //   .then((response) => {
    //     if (response.data && response.data.responses) {
    //       response.data.responses.forEach((item) => {
    //         console.log(item.status);
    //         if (item.status === 409) {
    //           Swal.fire({
    //             title: "Warning!",
    //             text: item.message,
    //             icon: "warning",
    //             timer: 1500,
    //             timerProgressBar: true,
    //             didClose: () => {
    //               window.location.reload();
    //             },
    //           });
    //         } else {
    //           Swal.fire({
    //             title: "Success!",
    //             text: item.message,
    //             icon: "success",
    //             timer: 1500,
    //             timerProgressBar: true,
    //             didClose: () => {
    //               window.location.reload();
    //             },
    //           });
    //         }
    //       });
    //     } else {
    //       console.log("Invalid response format");
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error submitting attendance data:", error);
    //   });
  };

  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    console.log(absentStudents);
  }, [absentStudents]);

  return (
    <div className="attendance-container">
      <h1>Take Attendance</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="filter-section">
          <label>
            Class:
            <select
              value={selectedClass}
              onChange={(e) => {
                if (e.target.value === "") setSelectedSection("");
                setSelectedClass(e.target.value);
              }}
            >
              <option value="">Choose a Subject</option>
              {subjects.map((data) => (
                <option key={data.subject_id} value={data.subject_id}>
                  {data.subject_id} - {data.subjects.subject_description}
                </option>
              ))}
            </select>
          </label>
          &nbsp;&nbsp;
          <label>
            Section:
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={selectedClass === ""}
            >
              <option value="">Choose a section</option>
              {sections.map((data) => (
                <option key={data.section_id} value={data.section_id}>
                  {data.section_id}
                </option>
              ))}
            </select>
          </label>
          <label className="date-filter">
            Date:
            <input
              className="date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>
          <button
            className="show-student"
            onClick={showStudents}
            disabled={!selectedClass || !selectedSection}
          >
            Show
          </button>
        </div>

        <div className="attendance-list">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8">No Student Found</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.uuid}>
                    <td>{student.student_id}</td>
                    <td>{student.name}</td>
                    <td>
                      <div className="attendance-options">
                        <label>
                          <input
                            type="radio"
                            value="Present"
                            name={`attendance-${student.uuid}`}
                            defaultChecked
                            // checked={!absentStudents.includes(student.uuid)}
                            onChange={() =>
                              handleAttendanceStatusChange(
                                student.uuid,
                                "Present"
                              )
                            }
                          />
                          Present
                        </label>
                        <label>
                          <input
                            type="radio"
                            value="Absent"
                            name={`attendance-${student.uuid}`}
                            // checked={absentStudents.includes(student.uuid)}
                            onChange={() =>
                              handleAttendanceStatusChange(
                                student.uuid,
                                "Absent"
                              )
                            }
                          />
                          Absent
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination>
            <Pagination.Prev
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage === 1}
            />
            {[...Array(Math.ceil(totalStudents / itemsPerPage))].map(
              (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === activePage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              )
            )}
            <Pagination.Next
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage === Math.ceil(totalStudents / itemsPerPage)}
            />
          </Pagination>
        </div>

        <div className="submit-section">
          <button
            onClick={submitAttendance}
            className="submit-button"
            disabled={
              !(!!selectedClass && !!selectedSection && !!students.length)
            }
          >
            Submit Attendance
          </button>
        </div>
      </form>
    </div>
  );
};

export default Attendance;
