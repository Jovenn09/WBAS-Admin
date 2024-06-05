import React, { useContext, useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";
import supabase from "../../config/supabaseClient";
import { AuthContext } from "../../context/AuthContext";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import ForgotPasswordModal from "../Login/ForgotPasswordModal";
import { IoIosArrowRoundBack } from "react-icons/io";

const TeacherLogin = () => {
  const { setUser } = useContext(AuthContext);
  const [state, setState] = useState({
    username: "",
    password: "",
  });

  const history = useHistory();

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleShowForgotPasswordModal = () => setShowForgotPasswordModal(true);
  const handleCloseForgotPasswordModal = () =>
    setShowForgotPasswordModal(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, password } = state;

    try {
      let { data: teachers, error: userError } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", username);

      if (teachers.length === 0) throw new Error("Can't sign you in");
      if (userError) throw new Error(userError.details);

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: username,
          password: password,
        }
      );

      if (authError) throw new Error(authError.message);

      if (data.user.user_metadata.access !== "instructor") {
        throw new Error("Can't sign you in");
      }

      setUser(data.user);
    } catch (error) {
      const message = error?.message || "Something went wrong";
      Swal.fire({
        icon: "warning",
        title: message,
        timer: 1500,
        timerProgressBar: true,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    }
  };

  return (
    <div className="header-container">
      <div className="university-header my-4">
        <img
          src="images/CITE.png"
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
          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <h2>
                {" "}
                COLLEGE OF INFORMATION TECHNOLOGY <br />
                <br /> Attendance System
              </h2>
            </div>
            <div className="d-flex px-2">
              <IoIosArrowRoundBack
                className="back-arrow"
                onClick={() => history.push("/")}
                size={30}
                color="#0bc452"
              />
            </div>
            <div className="form-group">
              <label>
                <FaUser /> Email
              </label>
              <input
                type="text"
                name="username"
                value={state.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <FaLock /> Password
              </label>
              <input
                type="password"
                name="password"
                value={state.password}
                onChange={handleInputChange}
                required
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              />
            </div>

            <button type="submit">Login</button>
            <Button variant="link" onClick={handleShowForgotPasswordModal}>
              Forgot Password?
            </Button>
          </form>
        </div>
      </div>
      <ForgotPasswordModal
        show={showForgotPasswordModal}
        handleClose={handleCloseForgotPasswordModal}
      />
    </div>
  );
};

export default TeacherLogin;
