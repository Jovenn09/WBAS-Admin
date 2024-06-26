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
import { arraySwap, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { SortableContext, rectSwappingStrategy } from "@dnd-kit/sortable";
import Spinner from "react-bootstrap/Spinner";
import { tr } from "date-fns/locale";
import ChairCard from "./ChairCard";
import { PiChairFill } from "react-icons/pi";
import { RxHeight } from "react-icons/rx";

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
  const [numOfCol, setNumOfCol] = useState(10);

  const [hasReorder, setHasReorder] = useState(false);
  const [sorting, setSorting] = useState(false);

  const [schedule, setSchedule] = useState([]);

  const [layoutMode, setLayoutMode] = useState({ mode: "custom", column: 0 });

  const [activePage, setActivePage] = useState(1);

  const itemsPerPage = 10;
  let clickTimer = null;

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
    setSchedule([]);
  }, [selectedClass]);

  useEffect(() => {
    getHandleClass();
  }, [selectedSem]);

  async function showStudents(sortBy, isAscending) {
    setSorting(true);
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
    setSorting(false);
    setAbsentStudents([]);
    setExcuseStudents([]);
  }

  const sortingHandler = (orderBool, sortName) => {
    showStudents(sortName, orderBool);
  };

  const onSaveSort = async () => {
    setSorting(true);
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

    setSorting(false);
    alert("Successfully save ");
  };

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

  useEffect(() => {
    console.log(absentStudents);
    console.log(excuseStudents);
  }, [absentStudents, excuseStudents]);

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

    console.log(active, over);
    if (!active?.id || !over?.id) return;

    if (active.id === over.id) return;

    setHasReorder(true);
    setStudents((tasks) => {
      const originalPos = getStudentPosition(active.id);
      const newPos = getStudentPosition(over.id);

      return arraySwap(tasks, originalPos, newPos);
    });
  };

  useEffect(() => {
    if (!selectedClass || !selectedSection) return setNumOfCol(10);

    let colNum = localStorage.getItem(
      `column-${selectedClass}-${selectedSection}`
    );
    let arrMode = localStorage.getItem(
      `mode-${selectedClass}-${selectedSection}`
    );

    if (arrMode) {
      const json = JSON.parse(arrMode);
      setLayoutMode(json);
    }

    if (!colNum) {
      localStorage.setItem(
        `column-${selectedClass}-${selectedSection}`,
        numOfCol
      );
      return;
    }

    setNumOfCol(colNum);
  }, [selectedClass, selectedSection]);

  function setArrangment(mode, col) {
    localStorage.setItem(
      `mode-${selectedClass}-${selectedSection}`,
      JSON.stringify({ mode, col })
    );
  }

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
            onClick={() => showStudents("order", true)}
            disabled={!selectedClass || !selectedSection}
          >
            Show
          </button>
        </div>
        {schedule.map((obj, index) => (
          <p className="m-1" key={index}>
            <span style={{ textTransform: "capitalize" }}>{obj.day}</span>,{" "}
            {format24HourTo12Hour(obj.start_time)} -
            {format24HourTo12Hour(obj.end_time)} | {obj.room}
          </p>
        ))}
        <div>
          <div>
            <PiChairFill color="green" style={{ marginRight: "8px" }} />
            <span>Present</span>
            <span> - Single Click</span>
          </div>
          <div>
            <PiChairFill color="red" style={{ marginRight: "8px" }} />
            <span>Absent</span>
            <span> - Double Click</span>
          </div>
          <div>
            <PiChairFill color="orange" style={{ marginRight: "8px" }} />
            <span>Excuse</span>
            <span> - Right Click</span>
          </div>
        </div>
        <div className="d-flex gap-2 my-3 mt-4">
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
              Sort by Sitting Arrangement
            </button>
            <button
              className="btn btn-success"
              disabled={!hasReorder}
              onClick={onSaveSort}
            >
              Save Sitting Arrangement
            </button>
          </div>
        </div>

        {students.length > 0 && (
          <div>
            <div className="d-flex gap-2 ">
              <label htmlFor="grid-col">Number of Columns: </label>
              <input
                id="grid-col"
                type="number"
                defaultValue={numOfCol}
                onChange={(e) => {
                  setNumOfCol(e.target.value);
                  localStorage.setItem(
                    `column-${selectedClass}-${selectedSection}`,
                    e.target.value
                  );
                }}
                disabled={layoutMode.mode !== "custom"}
              />
            </div>
            <label>
              Arrangment:
              <select
                style={{ height: "fit-content" }}
                value={layoutMode.mode}
                onChange={(e) => {
                  const mode = e.target.value;
                  let column = 0;

                  switch (mode) {
                    case "mac-lab":
                      column = 12;
                      setArrangment(mode, column);
                      break;
                    case "its-200":
                      column = 14;
                      setArrangment(mode, column);
                      break;
                    case "its-201":
                      column = 14;
                      setArrangment(mode, column);
                      break;
                    case "ptc-303":
                      column = 14;
                      setArrangment(mode, column);
                      break;
                    case "ptc-304":
                      column = 10;
                      setArrangment(mode, column);
                      break;
                    case "ptc-305":
                      column = 10;
                      break;
                    case "ptc-306":
                      column = 10;
                      setArrangment(mode, column);
                      break;
                    default:
                      column = 10;
                      setArrangment(mode, column);
                      break;
                  }

                  setLayoutMode({ mode, column });
                }}
              >
                <option value="custom">Custom</option>
                <option value="mac-lab">Mac Lab</option>
                <option value="its-200">ITS-200</option>
                <option value="its-201">ITS-201</option>
                <option value="ptc-303">PTC-303</option>
                <option value="ptc-304">PTC-304</option>
                <option value="ptc-305">PTC-305</option>
                <option value="ptc-306">PTC-306</option>
              </select>
            </label>
          </div>
        )}

        <div
          className="attendance-list"
          style={{
            gridTemplateColumns:
              layoutMode.mode === "custom"
                ? `repeat(${Number(numOfCol) + 1}, 1fr)`
                : `repeat(${layoutMode.column}, 1fr)`,
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={students} strategy={rectSwappingStrategy}>
              {students.map((student, index) => (
                <ChairCard
                  key={index}
                  name={student.name}
                  id={student.id}
                  handleAttendanceStatusChange={handleAttendanceStatusChange}
                />
              ))}
            </SortableContext>
          </DndContext>
          {layoutMode.mode === "custom" && (
            <div
              className="divider-grid"
              style={{
                gridRowEnd: Math.ceil(Number(students.length / numOfCol) + 1),
                gridColumnStart: Math.ceil(Number(numOfCol) / 2) + 1,
              }}
            ></div>
          )}

          {(layoutMode.mode === "its-200" || layoutMode.mode === "ptc-303") && (
            <>
              <div
                className="divider-grid"
                style={{ gridRowEnd: 10, gridColumnStart: 5 }}
              ></div>
              <div
                className="divider-grid"
                style={{ gridRowEnd: 10, gridColumnStart: 10 }}
              ></div>
            </>
          )}

          {layoutMode.mode === "its-201" && (
            <div
              className="divider-grid"
              style={{ gridRowEnd: 10, gridColumnStart: 5 }}
            ></div>
          )}

          {layoutMode.mode === "mac-lab" && (
            <div
              className="divider-grid"
              style={{ gridRowEnd: 10, gridColumnStart: 3, gridColumnEnd: -3 }}
            ></div>
          )}

          {layoutMode.mode === "ptc-304" && (
            <>
              <div
                className="divider-grid"
                style={{
                  gridRowStart: 2,
                  gridRowEnd: 2,
                  gridColumnStart: 1,
                  gridColumnEnd: -1,
                }}
              ></div>
              <div
                className="divider-grid"
                style={{
                  gridRowStart: 5,
                  gridRowEnd: 5,
                  gridColumnStart: 1,
                  gridColumnEnd: -1,
                }}
              ></div>
            </>
          )}

          {(layoutMode.mode === "ptc-305" || layoutMode.mode === "ptc-306") && (
            <>
              <div
                className="divider-grid"
                style={{ gridRowEnd: 10, gridColumnStart: 2, gridColumnEnd: 2 }}
              ></div>
              <div
                className="divider-grid"
                style={{ gridRowEnd: 10, gridColumnStart: 5, gridColumnEnd: 5 }}
              ></div>
              <div
                className="divider-grid"
                style={{ gridRowEnd: 10, gridColumnStart: 8, gridColumnEnd: 8 }}
              ></div>
            </>
          )}
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
