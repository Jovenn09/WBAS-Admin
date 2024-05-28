import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Row({ student, index, handleAttendanceStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: student.id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <tr
      key={student.id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
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
                handleAttendanceStatusChange(student.id, "Present")
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
  );
}

export default function TableRow({ students, handleAttendanceStatusChange }) {
  return (
    <>
      {students.map((student, index) => (
        <Row
          key={index}
          student={student}
          index={index}
          handleAttendanceStatusChange={handleAttendanceStatusChange}
        />
      ))}
    </>
  );
}
