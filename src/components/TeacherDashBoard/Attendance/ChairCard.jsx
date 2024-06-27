import { useState } from "react";
import { PiChairFill } from "react-icons/pi";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { RxDragHandleHorizontal } from "react-icons/rx";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ChairCard({ name, id, handleAttendanceStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  let clickTimer = null;
  const [chairColor, setChairColor] = useState("green");

  return (
    <OverlayTrigger
      key={"name"}
      placement={"top"}
      overlay={<Tooltip id={`tooltip-${name}`}>{name}</Tooltip>}
    >
      <div className="chair-card" ref={setNodeRef} style={style}>
        <div className="d-flex align-items-center flex-column justify-center">
          <PiChairFill
            className="drag-icon"
            {...attributes}
            {...listeners}
            size={15}
            onContextMenu={(e) => {
              e.preventDefault();
              setChairColor("orange");
              handleAttendanceStatusChange(id, "Excuse");
            }}
            onClick={() => {
              if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
              }
              clickTimer = setTimeout(() => {
                setChairColor("green");
                handleAttendanceStatusChange(id, "Present");

                clickTimer = null;
              }, 250);
            }}
            onDoubleClick={() => {
              if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
              }
              setChairColor("red");
              handleAttendanceStatusChange(id, "Absent");
            }}
            color={chairColor}
          />
          <span
            onDoubleClick={(e) => e.preventDefault()}
            className="m-0 student-seat-name"
            style={{ fontSize: 10, textAlign: "center" }}
          >
            {name.split(",")[0]}
          </span>
          {/* <div
            className="drag-icon"
            {...attributes}
            {...listeners}
            style={{ marginLeft: "auto" }}
          >
            <RxDragHandleHorizontal />
          </div> */}
        </div>
      </div>
    </OverlayTrigger>
  );
}
