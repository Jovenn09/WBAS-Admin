import React, { useContext, useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import "./Login.css";
import Footer from "../Footer/Footer";
import Swal from "sweetalert2";
import supabase, { supabaseAdmin } from "../../config/supabaseClient";
import { AuthContext } from "../../context/AuthContext";
import { MdEmail } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import VerifyEmail from "./VerifyEmail";
import Spinner from "react-bootstrap/Spinner";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useHistory } from "react-router-dom";

const defaultStudentIdObj = {
  deptCode: "",
  year: "",
  sequence: "",
};

const phinmaEmail = /^[a-zA-Z0-9._%+-]+\.up@phinmaed\.com$/;

const Registration = () => {
  const history = useHistory();

  const [showModal, setShowModal] = useState(false);
  const { setUser } = useContext(AuthContext);

  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    yearLevel: "",
    contactNumber: "",
    confirmPassword: "",
  });

  const [studentNumber, setStudentNumber] = useState(defaultStudentIdObj);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [finalData, setFinalData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    let { name, value } = event.target;

    if (name === "contactNumber") {
      if (/^\d*$/.test(value)) setState({ ...state, [name]: value });
      return;
    }

    if (name === "name") value = value.toUpperCase();

    setState({ ...state, [name]: value });
  };

  function onChangeStudentNumHandler(key, e) {
    const value = e.target.value;

    if (isNaN(Number(value))) return;

    let regExp = /^\d{0,2}$/;

    switch (key) {
      case "deptCode":
        break;
      case "year":
        regExp = /^\d{0,4}$/;
        break;
      case "sequence":
        regExp = /^\d{0,6}$/;
        break;
    }

    if (regExp.test(value)) {
      setStudentNumber((prev) => ({ ...prev, [key]: value }));
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const {
      name,
      contactNumber,
      address,
      email,
      yearLevel,
      confirmPassword,
      password,
    } = state;

    try {
      setLoading(true);
      if (!phinmaEmail.test(email)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Email",
          text: "Please use phinma email",
        });
        return;
      }

      if (password !== confirmPassword)
        throw new Error("Password does not match");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { access: "student" },
        },
      });

      if (error) throw new Error(error.message);

      const { error: insertError } = await supabase.from("students").insert([
        {
          uuid: data.user.id,
          student_id: `${studentNumber.deptCode}-${studentNumber.year}-${studentNumber.sequence}`,
          email: email,
          name: name,
          year_level: yearLevel,
          address: address,
          contact_number: contactNumber,
        },
      ]);

      if (insertError) throw new Error(insertError.message);

      setShowModal(true);
    } catch (error) {
      const message = error?.message ?? "Something went wrong";
      Swal.fire({
        icon: "warning",
        title: message,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    }
    setLoading(false);
  };

  return (
    <div className="header-container">
      <div className="university-header my-4 mb-5 d-flex align-items-center">
        <img
          src="images/CITE.png"
          alt="University Logo"
          className="CITE-logo m-0"
          width={120}
          height={120}
        />
        <img
          src="images/titles.png"
          alt="University Logo"
          className="headert-logo m-0"
        />
        <img
          src="images/phinma_logo.jpg"
          alt="University Logo"
          className="university-logo m-0"
        />
      </div>
      <div className="login-container">
        <div className="card-container px-4 py-3 d-flex flex-column">
          <div>
            <IoIosArrowRoundBack
              className="back-arrow"
              onClick={() => history.push("/login")}
              size={30}
              color="#0bc452"
            />
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <h2>
              {" "}
              COLLEGE OF INFORMATION TECHNOLOGY <br />
              <br /> Attendance System
            </h2>
            <div className="form-group">
              <label>
                <FaUser /> Full Name
              </label>
              <input
                type="text"
                name="name"
                onChange={handleInputChange}
                value={state.name}
                placeholder="(Last Name), (First Name) (Middle Initial)"
                required
              />
            </div>
            <div className="form-group">
              <label>
                <FaUser /> Student Number
              </label>
              <div className="d-flex gap-2 w-100 align-items-center">
                <input
                  type="text"
                  name="department-code"
                  value={studentNumber.deptCode}
                  onChange={onChangeStudentNumHandler.bind(this, "deptCode")}
                  pattern="\d{2}"
                  placeholder="00"
                  required
                />
                <span className="fw-bolder">-</span>
                <input
                  type="text"
                  name="year"
                  value={studentNumber.year}
                  onChange={onChangeStudentNumHandler.bind(this, "year")}
                  pattern="\d{4}"
                  placeholder="0000"
                  required
                />
                <span className="fw-bolder">-</span>
                <input
                  type="text"
                  name="email"
                  value={studentNumber.sequence}
                  onChange={onChangeStudentNumHandler.bind(this, "sequence")}
                  pattern="\d{5}(\d{1})?$"
                  placeholder="000000"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>
                <MdEmail /> Email
              </label>
              <input
                type="email"
                name="email"
                value={state.email}
                onChange={handleInputChange}
                placeholder="Enter your Phinma email address"
                required
              />
            </div>
            <div className="form-group">
              <label>Year Level</label>
              <select
                value={state.yearLevel}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, yearLevel: e.target.value }))
                }
                required
              >
                <option value="">Select Year Level</option>
                <option value="1st Year College">1st Year College</option>
                <option value="2nd Year College">2nd Year College</option>
                <option value="3rd Year College">3rd Year College</option>
                <option value="4th Year College">4th Year College</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                name="address"
                required
                placeholder="Enter you house address"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-number">Contact Number</label>
              <input
                id="contact-number"
                type="text"
                name="contactNumber"
                value={state.contactNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter you contact number"
              />
            </div>
            <div className="form-group">
              <label>
                <FaLock /> Password
              </label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={state.password}
                  onChange={handleInputChange}
                  required
                />
                {showPassword ? (
                  <FaEyeSlash
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "5px",
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <FaEye
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "5px",
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </div>
            <div className="form-group">
              <label>
                <FaLock /> Confirm Password
              </label>
              <div className="position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={state.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {showConfirmPassword ? (
                  <FaEyeSlash
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "5px",
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => setShowConfirmPassword(false)}
                  />
                ) : (
                  <FaEye
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "5px",
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => setShowConfirmPassword(true)}
                  />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Register"}
            </button>
          </form>
          <VerifyEmail
            showModal={showModal}
            setShowModal={setShowModal}
            email={state.email}
            metadata={{
              studentId: `${studentNumber.deptCode}-${studentNumber.year}-${studentNumber.sequence}`,
            }}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Registration;
