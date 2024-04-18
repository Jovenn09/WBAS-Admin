import React, { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import { Pagination } from "react-bootstrap";
import "./StudentDashBoard.css";
import Swal from "sweetalert2";
import supabase from "../../config/supabaseClient";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { AuthContext } from "../../context/AuthContext";

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

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [subjects, setSubjects] = useState([]);

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

    if (selectedDate) query.eq("date", selectedDate);

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
  }, [selectedSubject, currentPage, selectedDate]);

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
        <div>
          <label htmlFor="dateFilter">Filter by Date:</label>
          <input
            type="date"
            id="dateFilter"
            onChange={(e) => handleDateFilter(e.target.value)}
            className="date-filter"
            value={selectedDate}
          />
          <label htmlFor="subjectFilter" className="subject-container">
            Filter by Subject:
          </label>
          <select
            id="subjectFilter"
            onChange={(e) => handleSubjectFilter(e.target.value)}
            className="subject-filter"
            value={selectedSubject}
          >
            <option value="">All Subjects</option>
            {subjects.map((data) => (
              <option key={data.subject_id} value={data.subject_id}>
                {data.subjects.subject_description}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSelectedDate("");
              setSelectedSubject("");
            }}
          >
            Clear Filter
          </button>
        </div>

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
          {/* <p>Total Present: {calculatePresentDays(filteredAttendanceData)}</p> */}
          <p>Total Absences: {totalAbsents}</p>
        </div>
        <div className="footer">
          <h6>© 2023 School Attendance System. All rights reserved.</h6>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
