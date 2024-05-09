import React, { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import { Pagination } from "react-bootstrap";
import "./StudentDashBoard.css";
import Swal from "sweetalert2";
import supabase from "../../config/supabaseClient";
import { AuthContext } from "../../context/AuthContext";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

function AttendanceAlert() {
  const [show, setShow] = useState(true);

  setTimeout(() => {
    setShow(false);
  }, 3000);

  if (show) {
    return (
      <Alert
        style={{ width: 500, position: "fixed", top: 30, right: 30 }}
        variant="danger"
        onClose={() => setShow(false)}
        dismissible
      >
        <Alert.Heading style={{ fontSize: 16 }}>
          You have already 3 absences. Please take note of your attendance
        </Alert.Heading>
      </Alert>
    );
  }
}

const StudentDashboard = () => {
  const { user, setUser } = useContext(AuthContext);

  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));
    const name = userProfile ? userProfile.name : "";
    setStudentName(name);
  }, []);

  useEffect(() => {
    console.log(user.student_id);
  }, [user]);

  const [attendanceData, setAttendanceData] = useState([]);
  const [totalAbsents, setTotalAbsents] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [subjects, setSubjects] = useState([]);
  const [subjectTotalAttendance, setSubjectTotalAttendance] = useState([]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const calculatePresentDays = (filteredData) => {
    return filteredData.filter((record) => record.status === "present").length;
  };

  const handleDateFilter = (selectedDate) => {
    console.log(selectedDate);
    setSelectedDate(selectedDate);
  };

  const handleSubjectFilter = (selectedSubject) => {
    console.log(selectedSubject);
    setSelectedSubject(selectedSubject);
  };

  const today = new Date().toISOString().split("T")[0];

  const isFutureDate = selectedDate && selectedDate > today;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  async function onLogoutHandler() {
    const { isConfirmed } = await Swal.fire({
      title: "Log out",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      reverseButton: true,
    });

    if (isConfirmed) {
      setUser(null);
      supabase.auth.signOut();
    }
  }

  async function getAttendanceData() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage - 1;

    let query = supabase
      .from("attendance")
      .select(
        `
    subject_id,
    subjects (
      subject_description
    ),
    date
    `
      )
      .ilike("subject_id", `%${selectedSubject}%`)
      .eq("student_id", user.student_id)
      .eq("attendance_status", "absent")
      .range(start, end);

    if (startDate && endDate) query.lte("date", endDate).gte("date", startDate);

    const { data, error } = await query;

    if (error) return console.log(error);

    const uniqueData = data.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.subject_id === item.subject_id)
    );
    setSubjects(uniqueData);
    setAttendanceData(data);
    console.log(data);
  }

  async function getTotalAbsents() {
    const { count } = await supabase
      .from("attendance")
      .select("*", { count: "exact" })
      .eq("attendance_status", "absent")
      .eq("student_id", user.student_id);
    setTotalAbsents(count);
  }

  useEffect(() => {
    getTotalAbsents();
  }, []);

  useEffect(() => {
    getAttendanceData();
  }, [selectedSubject, currentPage]);

  useEffect(() => {
    if (startDate && endDate) {
      getAttendanceData();
    }
  }, [startDate, endDate]);

  async function getStudentName() {
    const { data, error } = await supabase
      .from("students")
      .select("name")
      .eq("uuid", user.id);

    if (error) return console.log(error.message);

    setStudentName(data[0].name);
  }

  useEffect(() => {
    getStudentName();
  }, [user]);

  async function getTotalAbsentsBySubject() {
    const data = await Promise.all(
      subjects.map(async (item) => {
        const { count } = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("subject_id", item.subject_id)
          .eq("student_id", user.student_id);

        return {
          count,
          name: `${item.subject_id} - ${item.subjects.subject_description}`,
        };
      })
    );

    setSubjectTotalAttendance(data);
  }

  useEffect(() => {
    if (!subjects.length) return;
    getTotalAbsentsBySubject();
  }, [subjects]);

  return (
    <div>
      <header>
        <h1 className="student-header">Student Attendance System</h1>
        <div className="student-logout-link">
          <div className="dropdown">
            <div onClick={toggleDropdown} className="drop-trigger">
              Menu
            </div>
            {dropdownOpen && (
              <div className="dropdown-content">
                <NavLink
                  to="/studentdashboard"
                  activeClassName="active"
                  onClick={closeDropdown}
                >
                  <FaHome /> Home
                </NavLink>
                <NavLink
                  to="edit-profile-student"
                  activeClassName="active"
                  onClick={closeDropdown}
                >
                  <FaUserEdit /> Edit Profile
                </NavLink>
                <a
                  onClick={() => {
                    closeDropdown();
                    onLogoutHandler();
                  }}
                >
                  <FaSignOutAlt /> Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
      {attendanceData.length > 2 && <AttendanceAlert />}

      <div className="student-dashboard">
        <h2>
          WELCOME <br /> {studentName}
        </h2>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Form.Group className="mb-2">
            <fieldset
              className="d-flex align-items-center justify-content-start flex-row"
              style={{ gap: "1rem" }}
            >
              <div style={{ gap: "1rem", width: "90%", maxWidth: "200px" }}>
                <Form.Label htmlFor="dateFilter" className="flex-fill">
                  Start Date:
                </Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                ></Form.Control>
              </div>
              <div style={{ gap: "1rem", width: "90%", maxWidth: "200px" }}>
                <Form.Label htmlFor="dateFilter">End Date:</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                ></Form.Control>
              </div>
            </fieldset>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="subjectFilter">Filter by Subjec:</Form.Label>
            <Form.Select
              style={{ width: "100%", maxWidth: "350px" }}
              value={selectedSubject}
              onChange={(e) => handleSubjectFilter(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((data) => (
                <option key={data.subject_id} value={data.subject_id}>
                  {data.subjects.subject_description}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <button
            className="mt-3"
            onClick={() => {
              window.location.reload();
            }}
          >
            Clear Filter
          </button>
        </Form>

        <div className="personal-attendance">
          <h3>Personal Attendance Report</h3>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isFutureDate ? (
                <tr>
                  <td colSpan="3">No Attendance Yet for {selectedDate}</td>
                </tr>
              ) : totalAbsents === 0 ? (
                <tr>
                  <td colSpan="3">No Attendance Found.</td>
                </tr>
              ) : (
                attendanceData.map((record, index) => (
                  <tr key={record.subject_id + record.date + index}>
                    <td>{`${record.subject_id} - ${record.subjects.subject_description}`}</td>
                    <td>{new Date(record.date).toLocaleDateString("en-GB")}</td>
                    <td className={"red"}>Absent</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pagination-container">
            <Pagination>
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(Math.ceil(totalAbsents / itemsPerPage))].map(
                (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                )
              )}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === Math.ceil(totalAbsents / itemsPerPage)
                }
              />
            </Pagination>
          </div>
        </div>
        <div className="attendance-summary">
          <h3>Attendance Summary</h3>
          <p>Total Absences: {totalAbsents}</p>
          <hr />
          {subjectTotalAttendance.map(({ count, name }) => (
            <div>
              <span>
                {name}:&nbsp;&nbsp;<strong>{count}</strong>
              </span>
            </div>
          ))}
        </div>
        <div className="footer">
          <h6>© 2024 School Attendance System. All rights reserved.</h6>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
