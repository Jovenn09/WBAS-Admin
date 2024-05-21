import React from "react";
import { useHistory } from "react-router-dom";
import Footer from "../Footer/Footer";
import { FaUserCog, FaUser, FaChalkboardTeacher } from "react-icons/fa";
import "./Categories.css";

const Categories = () => {
  const history = useHistory();

  const handleRoleClick = (role) => {
    switch (role) {
      case "Login":
        history.push("/login");
        break;
      case "AdminLogin":
        history.push("/adminLogin");
        break;
      case "TeacherLogin":
        history.push("/teacherLogin");
        break;
      case "SecretaryLogin":
        history.push("/secretarylogin");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="header-container">
        <div className="university-header">
          <img
            src="images/PEN logo.jpg"
            alt="University Logo"
            className="phinma-logo"
          />
          <img
            src="images/titles.png"
            alt="University Logo"
            className="headert-logo"
          />
          <img
            src="images/phinma_logo.jpg"
            alt="University Logo"
            className="university-logo"
          />
        </div>
        <div className="login-container">
          <div className="card-container">
            <img
              src="/images/atend.jpg"
              alt="Student Attendance"
              className="login-image"
            />
            <form className="login-form">
              <div>
                {" "}
                <img
                  src="/images/CITE.png"
                  alt="cite logo "
                  style={{ width: 50, height: 50 }}
                />
                <h2>
                  {" "}
                  COLLEGE OF INFORMATION TECHNOLOGY <br />
                  <br /> Attendance System
                </h2>
              </div>
              <div className="form-group"></div>
              <div className="form-group"></div>

              <div className="buttons">
                <button onClick={() => handleRoleClick("SecretaryLogin")}>
                  <FaUserCog /> Administrator
                </button>
                <button onClick={() => handleRoleClick("TeacherLogin")}>
                  <FaChalkboardTeacher /> Instructor
                </button>
                <button onClick={() => handleRoleClick("Login")}>
                  <FaUser /> Student
                </button>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Categories;
