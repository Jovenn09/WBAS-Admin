import React, { useContext, useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Button } from "react-bootstrap";
import "./Login.css";
import Footer from "../Footer/Footer";
import Swal from "sweetalert2";
import ForgotPasswordModal from "./ForgotPasswordModal";
import supabase from "../../config/supabaseClient";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const { setUser } = useContext(AuthContext);

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

      setUser(data.user);
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
          <form onSubmit={handleSubmit} className="login-form">
            <h2>
              {" "}
              COLLEGE OF INFORMATION TECHNOLOGY <br />
              <br /> Attendance System
            </h2>
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
              />
            </div>

            <button type="submit">Login</button>
            <Button variant="link" onClick={handleShowForgotPasswordModal}>
              Forgot Password?
            </Button>
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
