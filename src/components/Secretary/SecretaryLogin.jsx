import React, { useContext, useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import Footer from "../Footer/Footer";
import Swal from "sweetalert2";
import supabase from "../../config/supabaseClient";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { IoIosArrowRoundBack } from "react-icons/io";

const SecretaryLogin = () => {
  const history = useHistory();
  const { setUser } = useContext(AuthContext);
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = state;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("login error:", error.stack);
        throw new Error(error.message);
      }

      if (data.user.user_metadata?.access !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Can't sign you in");
      }

      setUser(data.user);
    } catch (error) {
      Swal.fire({
        icon: "warning",
        title: error.message,
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
          src="/images/CITE.png"
          alt="University Logo"
          className="phinma-logo"
        />
        <img
          src="/images/titles.png"
          alt="University Logo"
          className="headert-logo"
        />
        <img
          src="/images/phinma_logo.jpg"
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
              />
            </div>

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SecretaryLogin;
