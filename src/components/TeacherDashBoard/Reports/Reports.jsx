import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Reports.css";
import supabase from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";
import XLSX from "xlsx";
import ShowSummary from "./modal/ShowSummary";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const Reports = () => {
  const { user } = useContext(AuthContext);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSem, setSelectedSem] = useState("first semester");
  const [isFetching, setIsFetching] = useState(false);

  const [reportData, setReportData] = useState([]);
  const [headerDate, setHeaderDate] = useState([]);

  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  const [recordCount, setRecordCount] = useState(0);

  const [modalShow, setModalShow] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({ name: "", id: "" });

  async function getSections() {
    const { data, error } = await supabase
      .from("assign")
      .select("section_id")
      .eq("subject_id", selectedClass)
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
      .eq("teacher_id", user.id)
      .eq("semester", selectedSem);

    const subjects = data.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.subject_id === item.subject_id)
    );

    setSubjects(subjects);
  }

  useEffect(() => {
    getHandleSubjects();
  }, [selectedSem]);

  useEffect(() => {
    if (selectedClass !== "") {
      getSections();
    }
  }, [selectedClass]);

  async function getStudentsBySection() {
    const { data, error, count } = await supabase
      .from("student_record")
      .select("*", { count: "exact" })
      .order("name", { ascending: true })
      .eq("section", selectedSection)
      .eq("subject", selectedClass)
      .ilike("name", `%${searchTerm}%`);

    if (error) return console.log(error);

    setStudents(data);
  }

  useEffect(() => {
    if (selectedSection && selectedClass) {
      getStudentsBySection();
    }
  }, [selectedSection]);

  async function getAttendanceRecord() {
    setIsFetching(true);

    try {
      const query = supabase
        .from("attendance")
        .select(
          `
      student_id,
      student_name,
      attendance_status,
      date
      `,
          { count: "exact" }
        )
        .ilike("subject_id", `%${selectedClass}%`)
        .ilike("section_id", `%${selectedSection}%`)
        .ilike("student_name", `%${searchTerm}%`)
        .eq("teacher_id", user.id)
        .in("attendance_status", ["absent", "excuse"])
        .order("date", { ascending: true });

      if (startDate && endDate) {
        query.lte("date", endDate).gte("date", startDate);
      }

      const { data, error, count } = await query;

      if (error) return console.log(error.message);

      const date = Array.from(new Set(data.map((record) => record.date)));
      setHeaderDate(date);

      const students = Array.from(
        new Set(data.map((record) => record.student_name))
      ).sort();

      const t = students.map((student) => {
        const att = data.filter((record) => record.student_name === student);
        const totalAbsence = att.filter(
          (record) =>
            record.attendance_status === "absent" ||
            record.attendance_status === "excuse"
        ).length;

        const newObj = {
          student_name: student,
          totalAbsence: totalAbsence,
          student_id: att[0].student_id,
        };

        return newObj;
      });

      console.log(t);
      setReportData(t);
      setRecordCount(count);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    if (selectedClass && selectedSection) {
      getAttendanceRecord();
    } else {
      setReportData([]);
    }
  }, [selectedClass, selectedSection, searchTerm, startDate, endDate]);

  const handlePrintReport = () => {
    window.print();
  };

  async function exportToCsv(recordsNum) {
    let query = supabase
      .from("attendance")
      .select(
        `
      student_id,
      student_name,
      attendance_status,
      date
      `
      )
      .eq("teacher_id", user.id)
      .ilike("subject_id", `%${selectedClass}%`)
      .ilike("section_id", `%${selectedSection}%`)
      .ilike("student_name", `%${searchTerm}%`)
      .order("date", { ascending: true });

    if (startDate && endDate) {
      query.lte("date", endDate).gte("date", startDate);
    }

    const { data, error, count } = await query;

    if (error) {
      return alert("something went wrong");
    }

    const date = Array.from(new Set(data.map((record) => record.date)));

    console.log(date);

    const students = Array.from(
      new Set(data.map((record) => record.student_name))
    ).sort();

    const n = students.map((student) => {
      const att = data.filter((record) => record.student_name === student);

      const newObj = {};
      att.forEach((r) => {
        newObj.student_id = r.student_id;
        newObj.student_name = student;
        newObj[r.date] = r.attendance_status.charAt(0).toUpperCase();
      });

      const numberOfAbsence = att.filter(
        (record) => record.attendance_status === "absent"
      );

      newObj.totalAbsence = `${numberOfAbsence.length}`;

      return newObj;
    });

    console.log(n);

    // const rows = data.map((obj) => ({
    //   date: obj.date,
    //   studentName: obj.student_name,
    //   subject: `${obj.subject_id} - ${obj.subjects.subject_description}`,
    //   status: obj.attendance_status,
    // }));

    // console.log(rows);

    const worksheet = XLSX.utils.json_to_sheet(n);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");

    const arrHeaders = ["Student Number", "Student Name"].concat(date);
    arrHeaders.push("Total Abscences");

    console.log(arrHeaders);

    const headers = XLSX.utils.sheet_add_aoa(worksheet, [arrHeaders], {
      origin: "A1",
    });

    const arrColumns = ["student_id", "student_name"].concat(date);
    arrColumns.push("totalAbsence");

    const columns_width = arrColumns.map((data) => {
      const max_width = n.reduce((w, r) => {
        console.log(data);
        // console.log(r[data]);
        return Math.max(w, r[data].length);
      }, 10);

      return { wch: max_width + 2 };
    });
    worksheet["!cols"] = columns_width;

    XLSX.writeFile(workbook, "Attendance_Record.xlsx", { compression: true });
  }

  return (
    <div className="report-container">
      <h1>Attendance Report</h1>
      <div className="report-controls">
        <div className="class-filter">
          <label htmlFor="classFilter" className="small-label">
            Semester:
          </label>
          <select
            id="classFilter"
            value={selectedSem}
            onChange={(e) => {
              setSelectedSem(e.target.value);
            }}
            className="small-select"
          >
            <option defaultChecked value={"first semester"}>
              First Semester
            </option>
            <option value={"second semester"}>Second Semester</option>
            <option value={"summer"}>Summer</option>
          </select>
          &nbsp;
          <label htmlFor="classFilter" className="small-label">
            Subject:
          </label>
          <select
            id="classFilter"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="small-select"
          >
            <option value="">Choose a Subject</option>
            {subjects.map((data) => (
              <option key={data.subject_id} value={data.subject_id}>
                {data.subject_id} - {data.subjects.subject_description}
              </option>
            ))}
          </select>
          &nbsp;
          <label htmlFor="section-filter" className="small-label">
            Section:
          </label>
          <select
            id="section-filter"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="small-select"
            disabled={!selectedClass}
          >
            <option value="">Select a Section</option>
            {sections.map((data) => (
              <option key={data.section_id} value={data.section_id}>
                {data.section_id}
              </option>
            ))}
          </select>
        </div>
        <br />
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
            className="mx-2 mb-2"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear Filter
          </button>
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
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="primary" onClick={handlePrintReport}>
            Print Report
          </Button>
          <br />
          <Button
            variant="primary"
            onClick={exportToCsv}
            disabled={reportData.length === 0}
          >
            Download CSV
          </Button>
        </div>
      </div>
      <div className="attendance-report">
        {isFetching && <Spinner animation="border" />}
        {reportData.length === 0 ? (
          <p>Please select subject and section</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  {/* <th>Date</th> */}
                  <th>Student Number</th>
                  <th>Student Name</th>
                  <th>Total Absences</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((student, index) => (
                  <tr key={index}>
                    <td>{student.student_id}</td>
                    <td>{student.student_name}</td>
                    <td>{student.totalAbsence}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => {
                          setSelectedStudent({
                            id: student.student_id,
                            name: student.student_name,
                          });
                          setModalShow(true);
                        }}
                      >
                        More details
                      </Button>
                    </td>
                    {/* <td>
                      {attendance.subject_id} -{" "}
                      {attendance.subjects.subject_description}
                    </td> */}
                    {/* <td
                      style={{
                        color:
                          attendance.attendance_status === "absent"
                            ? "red"
                            : "green",
                      }}
                    >
                      {attendance.attendance_status}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* <Pagination className="pagination">
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
            </Pagination> */}
          </>
        )}
      </div>
      <ShowSummary
        show={modalShow}
        onHide={() => setModalShow(false)}
        studentId={selectedStudent.id}
        studentName={selectedStudent.name}
      />
    </div>
  );
};

export default Reports;
