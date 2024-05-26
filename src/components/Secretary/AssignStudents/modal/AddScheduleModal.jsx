import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";
import { supabaseAdmin } from "../../../../config/supabaseClient";

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
}) {
  async function onAdd() {
    if (!day || !startTime || !endTime)
      return alert("Please fill the schedule");

    if (startTime > endTime) return alert("Invalid Time Range");

    let { data: schedule, error: readError } = await supabaseAdmin
      .from("schedule")
      .select("*")
      .eq("day", day)
      .gt("end_time", startTime)
      .lt("start_time", endTime);

    if (readError) return console.log(readError);
    if (schedule.length > 0) return alert("exist");

    setData((prev) => prev.concat({ day, startTime, endTime }));
    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Schedule</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Select
          onChange={(obj) => setDay(obj.value)}
          options={[
            { value: "monday", label: "Monday" },
            { value: "tuesday", label: "Tuesday" },
            { value: "wednesday", label: "Wednesday" },
            { value: "thursday", label: "Thursday" },
            { value: "friday", label: "Friday" },
            { value: "saturday", label: "Saturday" },
            { value: "sunday", label: "Sunday" },
          ]}
          required
        />
        <div className="d-flex gap-3 mt-4">
          <fieldset>
            <label htmlFor="start-time">Start Time</label>{" "}
            <input
              id="start-time"
              type="time"
              onChange={(e) => setStartTime(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="end-time">End Time</label>{" "}
            <input
              id="end-time"
              type="time"
              onChange={(e) => setEndTime(e.target.value)}
            />
          </fieldset>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onAdd}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
