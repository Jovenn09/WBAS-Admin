import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";
import { supabaseAdmin } from "../../../../config/supabaseClient";
import { format, parse } from "date-fns";
import { FaRegTrashAlt } from "react-icons/fa";
import Spinner from "react-bootstrap/Spinner";

const format24HourTo12Hour = (time24) => {
  const date = parse(time24, "HH:mm:ss", new Date());

  return format(date, "hh:mm aa");
};

export default function AddScheduleModal({
  show,
  handleClose,
  setData,
  day,
  setDay,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  assignId,
}) {
  const [sched, setSched] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [room, setRoom] = useState("");

  const [selectedDay, setSelectedDay] = useState("");

  async function onAdd() {
    try {
      setIsAdding(true);
      if (!day || !startTime || !endTime || !room)
        return alert("Please fill all the input field");

      if (startTime > endTime) return alert("Invalid Time Range");

      let { data: schedule, error: readError } = await supabaseAdmin
        .from("schedule")
        .select("*")
        .eq("day", day)
        .eq("room", room)
        .gt("end_time", startTime)
        .lt("start_time", endTime);

      if (readError) return console.log(readError);
      if (schedule.length > 0) return alert("Schedule is already been taken");

      const { data, error } = await supabaseAdmin
        .from("schedule")
        .insert([
          {
            day: day,
            subject: assignId.subject,
            section: assignId.section,
            start_time: startTime,
            end_time: endTime,
            room,
          },
        ])
        .select();

      if (error) return alert(error.message);

      setData((prev) => prev.concat({ day, startTime, endTime }));
      fetchSchedule(assignId.subject, assignId.section);
      setIsAdding(false);
      alert("Succesfully Added");
      setSelectedDay("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.log(error);
    } finally {
      setIsAdding(false);
    }
  }

  async function onDeleteSchedule(day, section, subject) {
    setIsDeleting(true);
    const { error } = await supabaseAdmin
      .from("schedule")
      .delete()
      .eq("day", day)
      .eq("section", section)
      .eq("subject", subject);

    if (error) return alert(error.message);

    alert("Deleted successfully");
    fetchSchedule(assignId.subject, assignId.section);
    setIsDeleting(false);
  }

  async function fetchSchedule(subject, section) {
    let { data: schedule, error } = await supabaseAdmin
      .from("schedule")
      .select("*")
      .eq("subject", subject)
      .eq("section", section);

    setSched(schedule);
  }

  useEffect(() => {
    if (show) {
      fetchSchedule(assignId.subject, assignId.section);
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Schedule</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Select
          onChange={(obj) => {
            setDay(obj.value);
            setSelectedDay(obj);
          }}
          options={[
            { value: "monday", label: "Monday" },
            { value: "tuesday", label: "Tuesday" },
            { value: "wednesday", label: "Wednesday" },
            { value: "thursday", label: "Thursday" },
            { value: "friday", label: "Friday" },
            { value: "saturday", label: "Saturday" },
            { value: "sunday", label: "Sunday" },
          ]}
          value={selectedDay}
          required
        />
        <div className="d-flex gap-3 mt-4 align-items-end">
          <fieldset>
            <label htmlFor="start-time">Start Time</label>{" "}
            <input
              id="start-time"
              type="time"
              onChange={(e) => setStartTime(e.target.value)}
              value={startTime}
            />
          </fieldset>

          <fieldset>
            <label htmlFor="end-time">End Time</label>{" "}
            <input
              id="end-time"
              type="time"
              onChange={(e) => setEndTime(e.target.value)}
              value={endTime}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="room">Room</label>
            <input
              type="text"
              onChange={(e) => setRoom(e.target.value)}
              value={room}
              style={{ height: "28px", width: "90px" }}
            />
          </fieldset>
          <Button variant="primary" onClick={onAdd} disabled={isAdding}>
            {isAdding ? <Spinner animation="border" size="sm" /> : "Add"}
          </Button>
        </div>
        <br />
        <br />
        <div>
          {isDeleting && <Spinner animation="border" />}
          {sched.map((obj, index) => (
            <div key={index} className="d-flex align-items-center gap-1">
              <p className="m-1">
                <span style={{ textTransform: "capitalize" }}>{obj.day}</span>,{" "}
                {format24HourTo12Hour(obj.start_time)} -
                {format24HourTo12Hour(obj.end_time)} | {obj.room}
              </p>

              <FaRegTrashAlt
                color="red"
                onClick={() => {
                  onDeleteSchedule(obj.day, obj.section, obj.subject);
                }}
              />
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}
