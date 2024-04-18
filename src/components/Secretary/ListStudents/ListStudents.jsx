import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ListStudents.css";
import { Pagination, Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import Select from "react-select";
import { supabaseAdmin } from "../../../config/supabaseClient";
import Swal from "sweetalert2";

const ListStudents = () => {
  const [filters, setFilters] = useState({
    teacher: "",
    subject: "",
    section: "",
  });

  const [assignedStudents, setAssignedStudents] = useState([]);
  const [listCount, setListCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [schoolYear, setSchoolYear] = useState([]);

  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterSubjects, setFilterSubjects] = useState("");
  const [filterSections, setFilterSections] = useState("");
  const [filterSchoolYear, setFilterSchoolYear] = useState("2324");

  const fetchAssignedStudents = async () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage - 1;

    let { data, error } = await supabaseAdmin
      .from("assign")
      .select(
        `
      teacher_id,
      teachers (
       name
      ),
      subject_id,
      subjects (
        subject_description
      ),
      section_id,
      school_year
    `
      )
      .ilike("subject_id", `%${filterSubjects?.value ?? ""}%`)
      .ilike("teacher_id", `%${filterInstructor?.value ?? ""}%`)
      .ilike("section_id", `%${filterSections?.value ?? ""}%`)
      .ilike("school_year", `%${filterSchoolYear?.value ?? ""}%`)
      .range(start, end);

    if (error) return console.error(error);

    const {
      _,
      count,
      error: countError,
    } = await supabaseAdmin
      .from("assign")
      .select("*", { count: "exact", head: true })
      .ilike("subject_id", `%${filterSubjects?.value ?? ""}%`)
      .ilike("teacher_id", `%${filterInstructor?.value ?? ""}%`)
      .ilike("section_id", `%${filterSections?.value ?? ""}%`);

    if (countError) return console.error(countError);

    setListCount(count);
    setAssignedStudents(data ?? []);
  };

  async function getSchoolYear() {
    let { data, error } = await supabaseAdmin
      .from("assign")
      .select("school_year");

    if (error) console.error(error.message);

    const schoolYearOption = data
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.school_year === item.school_year)
      )
      .map((data) => data.school_year);

    setSchoolYear(schoolYearOption);
  }

  useEffect(() => {
    getSchoolYear();
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (instructroId, subjectId, sectionId) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete Instructor handle.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });
    if (isConfirmed) {
      const { error } = await supabaseAdmin
        .from("assign")
        .delete()
        .eq("teacher_id", instructroId)
        .eq("subject_id", subjectId)
        .eq("section_id", sectionId);

      const { error: studentError } = await supabaseAdmin
        .from("student_record")
        .delete()
        .eq("subject", subjectId)
        .eq("section", sectionId);

      if (error) return console.error(error);
      if (studentError) return console.error(studentError);
      fetchAssignedStudents();
      Swal.fire("Removed!", "Successfully deleted!.", "success");
    }
  };

  const filteredStudents = assignedStudents.filter((student) => {
    return (
      (filters.teacher === "" || student.teacher === filters.teacher) &&
      (filters.subject === "" || student.subject === filters.subject) &&
      (filters.section === "" || student.section === filters.section) &&
      (filters.schoolYear === "" ||
        student.schoolYear === filters.schoolYear) &&
      (filters.studentId === "" || student.id === filters.studentId)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedStudents = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    fetchAssignedStudents();
  }, [filterSubjects, filterInstructor, filterSections, currentPage]);

  useEffect(() => {
    const getOptions = async () => {
      let { data: instructors, error: instructorError } = await supabaseAdmin
        .from("teachers")
        .select("*");

      if (!instructorError) setInstructors(instructors);

      let { data: subjects, error: errorSubjects } = await supabaseAdmin
        .from("subjects")
        .select("*");

      if (!errorSubjects) setSubjects(subjects);

      let { data: sections, error: sectionsError } = await supabaseAdmin
        .from("sections")
        .select("*");

      if (!sectionsError) setSections(sections);
    };
    getOptions();
  }, []);

  return (
    <div className="list-students-container">
      <h2>List of Assign Instructor</h2>

      <div className="filters">
        <label>
          Instructor:
          <Select
            value={filterInstructor}
            onChange={(selectedOption) => setFilterInstructor(selectedOption)}
            options={instructors.map((instructor) => ({
              value: instructor.uuid,
              label: instructor.name,
            }))}
            isClearable
            placeholder="Select Intructor"
          />
        </label>
        <label>
          Subject:
          <Select
            value={filterSubjects}
            onChange={(selectedOption) => setFilterSubjects(selectedOption)}
            options={subjects.map((subject) => ({
              value: subject.subject_code,
              label: subject.subject_description,
            }))}
            isClearable
            placeholder="Select Subject"
          />
        </label>

        <label>
          Section:
          <Select
            value={filterSections}
            onChange={(selectedOption) => setFilterSections(selectedOption)}
            options={sections.map((section) => ({
              value: section.section_code,
              label: section.section_code,
            }))}
            isClearable
            placeholder="Select Section"
          />
        </label>

        <label>
          School Year:
          <Select
            value={filterSchoolYear}
            onChange={(selectedOption) => setFilterSchoolYear(selectedOption)}
            options={schoolYear.map((school_year) => ({
              value: school_year,
              label: school_year,
            }))}
            isClearable
            placeholder="Select School Year"
          />
        </label>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Instructor</th>
            <th>Subject</th>
            <th>Section</th>
            <th>School Year</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {assignedStudents.map((data) => {
            return (
              <tr key={data.teacher_id + data.subject_id + data.section_id}>
                <td>{data.teachers.name}</td>
                <td>{data.subjects.subject_description}</td>
                <td>{data.section_id}</td>
                <td>{data.school_year}</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() =>
                      handleDelete(
                        data.teacher_id,
                        data.subject_id,
                        data.section_id
                      )
                    }
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Pagination>
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {[...Array(Math.ceil(listCount / itemsPerPage))].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(listCount / itemsPerPage)}
        />
      </Pagination>
    </div>
  );
};

export default ListStudents;
