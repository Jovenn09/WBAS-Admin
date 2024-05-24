import React, { useState, useEffect, useContext } from "react";
import { Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Attendance.css";
import Swal from "sweetalert2";
import supabase from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const Attendance = () => {
  const { user } = useContext(AuthContext);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSem, setSelectedSem] = useState("first semester");
  const [totalStudents, setTotalStudents] = useState(0);

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSection] = useState([]);

  const [absentStudents, setAbsentStudents] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [excuseStudents, setExcuseStudents] = useState([]);

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
      .eq("teacher_id", user.id)
      .eq("semester", selectedSem);

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
  }, [selectedSem]);

  async function showStudents() {
    const students = await supabase
      .from("student_record")
      .select("*", { count: "exact" })
      .order("name", { ascending: true })
      .eq("subject", selectedClass)
      .eq("section", selectedSection);

    setStudents(students.data);

    setTotalStudents(students.count);

    const defaultAttendance = students.data.map((student) => ({
      teacher_id: user.id,
      student_id: student.id,
      student_name: student.name,
      subject_id: selectedClass,
      section_id: selectedSection,
      date: selectedDate,
      attendance_status: "present",
      semester: selectedSem,
    }));

    setStudentAttendance(defaultAttendance);
  }

  // async function paginateStudents() {
  //   const start = (activePage - 1) * itemsPerPage;
  //   const end = activePage * itemsPerPage - 1;

  //   const students = await supabase
  //     .from("students")
  //     .select("*")
  //     .order("name", { ascending: true })
  //     .contains("subjects", [selectedClass])
  //     .contains("sections", [selectedSection])
  //     .range(start, end);

  //   setStudents(students.data);
  // }

  // useEffect(() => {
  //   if (students.length !== 0) {
  //     paginateStudents();
  //   }
  // }, [activePage]);

  // const handlePageChange = (pageNumber) => {
  //   setActivePage(pageNumber);
  // };

  const handleAttendanceStatusChange = (studentId, status) => {
    if (status === "Absent") {
      setAbsentStudents((prev) =>
        prev.includes(studentId) ? prev : [...prev, studentId]
      );
      setExcuseStudents((prev) => prev.filter((id) => id !== studentId));
      return;
    } else if (status === "Excuse") {
      setExcuseStudents((prev) =>
        prev.includes(studentId) ? prev : [...prev, studentId]
      );
      setAbsentStudents((prev) => prev.filter((id) => id !== studentId));
      return;
    }

    setAbsentStudents((prev) => prev.filter((id) => id !== studentId));
    setExcuseStudents((prev) => prev.filter((id) => id !== studentId));
  };

  const submitAttendance = async (e) => {
    e.preventDefault();

    const currentDate = new Date();
    const selectedAttendanceDate = new Date(selectedDate);

    console.log(currentDate);
    console.log(selectedAttendanceDate);

    if (!isSameDay(currentDate, selectedAttendanceDate))
      return Swal.fire({
        title: "Error!",
        text: "Make sure that the selected date is same as today",
        icon: "error",
        timer: 1500,
        timerProgressBar: true,
      });

    if (!selectedSection || !selectedDate || !selectedClass) {
      Swal.fire({
        title: "Error!",
        text: "Please select required fields",
        icon: "error",
        timer: 1000,
        timerProgressBar: true,
      });
    }

    // const attendanceRecord = studentAttendance.map((data) =>
    //   absentStudents.includes(data.student_id)
    //     ? { ...data, attendance_status: "absent", date: selectedDate }
    //     : { ...data, date: selectedDate }
    // );

    // const attendanceRecord = studentAttendance
    //   .filter((data) => absentStudents.includes(data.student_id))
    //   .map((data) => ({
    //     ...data,
    //     attendance_status: "absent",
    //     date: selectedDate,
    //   }));

    const attendanceRecord = studentAttendance.map((data) => {
      const isAbsents = absentStudents.includes(data.student_id);
      const isExcuse = excuseStudents.includes(data.student_id);

      if (isAbsents) {
        return { ...data, attendance_status: "absent", date: selectedDate };
      } else if (isExcuse) {
        return { ...data, attendance_status: "excuse", date: selectedDate };
      }

      return { ...data, date: selectedDate };
    });

    // console.log(attendanceRecord);

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
    console.log("Absents: ", absentStudents);
    console.log("Excuse: ", excuseStudents);
  }, [absentStudents, excuseStudents]);

  return (
    <div className="attendance-container">
      <h1>Take Attendance</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="filter-section">
          <label>
            Sem:
            <select
              value={selectedSem}
              onChange={(e) => {
                setSelectedSem(e.target.value);
              }}
            >
              <option defaultChecked value={"first semester"}>
                First Semester
              </option>
              <option value={"second semester"}>Second Semester</option>
              <option value={"summer"}>Summer</option>
            </select>
          </label>
          &nbsp;&nbsp;
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
            className="show-student mx-3"
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
                <th></th>
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
                students.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>
                      <div className="attendance-options">
                        <label>
                          <input
                            type="radio"
                            value="Present"
                            name={`attendance-${student.id}`}
                            defaultChecked
                            onChange={() =>
                              handleAttendanceStatusChange(
                                student.id,
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
                            name={`attendance-${student.id}`}
                            onChange={() =>
                              handleAttendanceStatusChange(student.id, "Absent")
                            }
                          />
                          Absent
                        </label>
                        <label>
                          <input
                            type="radio"
                            value="Absent"
                            name={`attendance-${student.id}`}
                            onChange={() =>
                              handleAttendanceStatusChange(student.id, "Excuse")
                            }
                          />
                          Excuse
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* <Pagination>
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
          </Pagination> */}
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
