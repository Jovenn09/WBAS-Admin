import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import supabase from "../../../../config/supabaseClient";
import Swal from "sweetalert2";
import Spinner from "react-bootstrap/Spinner";

export default function ShowSummary({ show, onHide, studentId, studentName }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getStudentAtttendance() {
    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
        date,
        attendance_status
       `
      )
      .eq("student_id", studentId)
      .in("attendance_status", ["absent", "excuse"])
      .order("date", { ascending: true });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    }

    console.log(data);
    setLoading(false);
    setData(data);
  }

  useEffect(() => {
    getStudentAtttendance();
    console.log("hello");
  }, []);

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {studentName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Spinner animation="border" />}
        {data.map((item) => (
          <p key={item.date}>
            {item.date} - {item.attendance_status}
          </p>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
