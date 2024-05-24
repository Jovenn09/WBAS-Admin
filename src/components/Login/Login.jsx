import React, { useContext, useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Button } from "react-bootstrap";
import "./Login.css";
import Footer from "../Footer/Footer";
import Swal from "sweetalert2";
import ForgotPasswordModal from "./ForgotPasswordModal";
import supabase from "../../config/supabaseClient";
import { AuthContext } from "../../context/AuthContext";
import { useHistory } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const history = useHistory();

  const [state, setState] = useState({
    email: "",
    password: "",
  });

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
    const { email, password } = state;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw new Error(error.message);

      if (data.user.user_metadata?.access !== "student") {
        await supabase.auth.signOut();
        throw new Error("Can't sign you in");
      }

      let { data: students } = await supabase
        .from("students")
        .select("student_id")
        .eq("uuid", data.user.id);

      console.log(students);

      setUser({ student_id: students[0].student_id, ...data.user });
    } catch (error) {
      const message = error?.message ?? "Something went wrong";
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
              />
            </div>

            <div className="form-group">
              <label>
                <FaUser /> Email
              </label>
              <input
                type="email"
                name="email"
                value={state.email}
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
                onPaste={(e) => {
                  e.preventDefault();
                }}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              />
            </div>

            <button type="submit">Login</button>
            <Button variant="link" onClick={handleShowForgotPasswordModal}>
              Forgot Password?
            </Button>
            <div className="d-flex justify-content-center align-items-center">
              <span>Don't have an account?</span>
              <Button
                className="p-0"
                style={{ width: "fit-content" }}
                variant="link"
                onClick={() => history.push("/registration")}
              >
                Register
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />

      <ForgotPasswordModal
        show={showForgotPasswordModal}
        handleClose={handleCloseForgotPasswordModal}
      />
    </div>
  );
};

export default Login;
