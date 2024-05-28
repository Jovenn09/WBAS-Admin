import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Attendance.css";
import Swal from "sweetalert2";
import supabase from "../../../config/supabaseClient";
import { AuthContext } from "../../../context/AuthContext";
import { format, parse } from "date-fns";
import TableRow from "../../../module/TableRow";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const format24HourTo12Hour = (time24) => {
  const date = parse(time24, "HH:mm:ss", new Date());

  return format(date, "hh:mm aa");
};

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

  const [isAscending, setIsAscending] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [hasReorder, setHasReorder] = useState(false);

  const [schedule, setSchedule] = useState([]);

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

  async function showStudents(sortBy, isAscending) {
    const students = await supabase
      .from("student_record")
      .select("*", { count: "exact" })
      .order(sortBy, { ascending: isAscending })
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

    let { data: schedule, error } = await supabase
      .from("schedule")
      .select("*")
      .eq("subject", selectedClass)
      .eq("section", selectedSection);

    if (error) return console.log(error.message);
    console.log(schedule);

    setSchedule(schedule);
  }

  const sortingHandler = (orderBool, sortName) => {
    showStudents(sortName, orderBool);
  };

  const onSaveSort = async () => {
    const newStudentsOrder = students.map((student, index) => ({
      ...student,
      order: index + 1,
    }));

    const { data, error } = await supabase
      .from("student_record")
      .upsert(newStudentsOrder)
      .select();

    setHasReorder(false);
    if (error) return console.log(error.message);

    console.log(data);
    alert("Successfully save ");
  };

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getStudentPosition = (id) =>
    students.findIndex((student) => student.id === id);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id === over.id) return;

    setHasReorder(true);
    setStudents((tasks) => {
      const originalPos = getStudentPosition(active.id);
      const newPos = getStudentPosition(over.id);

      return arrayMove(tasks, originalPos, newPos);
    });
  };

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
            onClick={() => showStudents("name", true)}
            disabled={!selectedClass || !selectedSection}
          >
            Show
          </button>
        </div>
        {schedule.map((obj, index) => (
          <p className="m-1" key={index}>
            <span style={{ textTransform: "capitalize" }}>{obj.day}</span>,{" "}
            {format24HourTo12Hour(obj.start_time)} -
            {format24HourTo12Hour(obj.end_time)}{" "}
          </p>
        ))}
        <label className="d-flex gap-2 my-3 mt-4">
          {/* <select>
            <option value="">Ascending</option>
            <option value="">Descending</option>
            <option value="">Random</option>
          </select> */}
          <button
            className="btn btn-warning"
            disabled={
              !selectedClass || !selectedSection || students.length === 0
            }
            onClick={() => sortingHandler(true, "name")}
          >
            Sort: A - Z
          </button>
          <button
            className="btn btn-warning"
            disabled={
              !selectedClass || !selectedSection || students.length === 0
            }
            onClick={() => sortingHandler(false, "name")}
          >
            Sort: Z - A
          </button>
          <div className="ms-auto d-flex gap-2">
            <button
              className="btn btn-primary"
              disabled={
                !selectedClass || !selectedSection || students.length === 0
              }
              onClick={() => sortingHandler(true, "order")}
            >
              Sort by My Order
            </button>
            <button
              className="btn btn-success"
              disabled={!hasReorder}
              onClick={onSaveSort}
            >
              Save Order Changes
            </button>
          </div>
        </label>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="8">No Student Found</td>
                  </tr>
                ) : (
                  <SortableContext
                    items={students}
                    strategy={verticalListSortingStrategy}
                  >
                    <TableRow
                      students={students}
                      handleAttendanceStatusChange={
                        handleAttendanceStatusChange
                      }
                    />
                  </SortableContext>
                )}
              </tbody>
            </DndContext>
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
