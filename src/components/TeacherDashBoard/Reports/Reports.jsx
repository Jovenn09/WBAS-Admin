import React, { useState, useEffect, useContext } from "react";
import { Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Reports.css";
import supabase from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";
import XLSX from "xlsx";

const Reports = () => {
  const { user } = useContext(AuthContext);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [reportData, setReportData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);

  const [activePage, setActivePage] = useState(1);
  const [recordCount, setRecordCount] = useState(0);
  const itemsPerPage = 10;

  async function getSections() {
    const { data, error } = await supabase
      .from("assign")
      .select("section_id")
      .eq("teacher_id", user.id);

    if (error) console.log(error);

    const sections = data.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.section_id === item.section_id)
    );
    setSections(sections);
  }

  async function getHandleSubjects() {
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

  async function getAttendanceRecord() {
    const start = (activePage - 1) * itemsPerPage;
    const end = activePage * itemsPerPage - 1;

    const query = supabase
      .from("attendance")
      .select(
        `
      student_id,
      student_name,
      subject_id,
      subjects (
        subject_description
      ),
      attendance_status,
      date
      `,
        { count: "exact" }
      )
      .ilike("subject_id", `%${selectedClass}%`)
      .ilike("section_id", `%${selectedSection}%`)
      .ilike("student_name", `%${searchTerm}%`)
      .eq("teacher_id", user.id)
      .eq("attendance_status", "absent")
      .order("date", { ascending: false })
      .range(start, end);

    if (startDate && endDate) {
      query.lte("date", endDate).gte("date", startDate);
    }

    const { data, error, count } = await query;
    setReportData(data);
    setRecordCount(count);
  }
  useEffect(() => {
    getHandleSubjects();
    getSections();
  }, []);

  useEffect(() => {
    getAttendanceRecord();
  }, [
    selectedClass,
    startDate,
    endDate,
    activePage,
    selectedSection,
    searchTerm,
  ]);

  const handlePrintReport = () => {
    window.print();
  };

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  useEffect(() => {
    console.log(recordCount);
  }, [recordCount]);

  async function exportToCsv(recordsNum) {
    let query = supabase
      .from("attendance")
      .select(
        `
      student_id,
      student_name,
      subject_id,
      subjects (
        subject_description
      ),
      attendance_status,
      date
      `
      )
      .eq("teacher_id", user.id)
      .ilike("subject_id", `%${selectedClass}%`)
      .ilike("section_id", `%${selectedSection}%`)
      .ilike("student_name", `%${searchTerm}%`)
      .order("date", { ascending: false });

    if (startDate && endDate) {
      query.lte("date", endDate).gte("date", startDate);
    }

    const { data, error, count } = await query;

    if (error) {
      return alert("something went wrong");
    }

    const rows = data.map((obj) => ({
      date: obj.date,
      studentName: obj.student_name,
      subject: `${obj.subject_id} - ${obj.subjects.subject_description}`,
      status: obj.attendance_status,
    }));

    console.log(rows);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");

    const headers = XLSX.utils.sheet_add_aoa(
      worksheet,
      [["Date", "Student Name", "Subject", "Status"]],
      {
        origin: "A1",
      }
    );

    const columns_width = ["date", "studentName", "subject", "status"].map(
      (data) => {
        const max_width = rows.reduce(
          (w, r) => Math.max(w, r[data].length),
          10
        );
        return { wch: max_width + 2 };
      }
    );
    worksheet["!cols"] = columns_width;

    XLSX.writeFile(workbook, "Attendance_Record.xlsx", { compression: true });
  }

  return (
    <div className="report-container">
      <h1>Attendance Report</h1>
      <div className="report-controls">
        <div className="date-range">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear Filter
          </button>
        </div>
        <div className="class-filter">
          <label htmlFor="classFilter" className="small-label">
            Filter by Class:
          </label>
          <select
            id="classFilter"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="small-select"
          >
            <option value="">All</option>
            {subjects.map((data) => (
              <option key={data.subject_id} value={data.subject_id}>
                {data.subject_id} - {data.subjects.subject_description}
              </option>
            ))}
          </select>
          &nbsp;
          <label htmlFor="section-filter" className="small-label">
            Filter by Section:
          </label>
          <select
            id="section-filter"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="small-select"
          >
            <option value="">All</option>
            {sections.map((data) => (
              <option key={data.section_id} value={data.section_id}>
                {data.section_id}
              </option>
            ))}
          </select>
        </div>
        <br />
        <input
          style={{ width: "200px" }}
          type="text"
          placeholder="Search by Name"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <br />
        <br />
        <button className="print-button" onClick={handlePrintReport}>
          Print Report
        </button>
        <button className="print-button" onClick={exportToCsv}>
          Download CSV
        </button>
      </div>
      <div className="attendance-report">
        {reportData.length === 0 ? (
          <p>No Attendance Report found on selected date range and class</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((attendance, index) => (
                  <tr key={index}>
                    <td>
                      {new Date(attendance.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td>{attendance.student_name}</td>
                    <td>
                      {attendance.subject_id} -{" "}
                      {attendance.subjects.subject_description}
                    </td>
                    <td
                      style={{
                        color:
                          attendance.attendance_status === "absent"
                            ? "red"
                            : "green",
                      }}
                    >
                      {attendance.attendance_status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination className="pagination">
              <Pagination.Prev
                onClick={() => handlePageChange(activePage - 1)}
                disabled={activePage === 1}
              />
              {[...Array(Math.ceil(recordCount / itemsPerPage))].map(
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
                disabled={activePage === Math.ceil(recordCount / itemsPerPage)}
              />
            </Pagination>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
