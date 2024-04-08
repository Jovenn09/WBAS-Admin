import React, { useState } from "react";
import { FaUser, FaLock, FaBook, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./StudentRegistration.css";
import Swal from "sweetalert2";
import axios from "axios";
import supabase from "../../config/supabaseClient";

const StudentRegistration = () => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    course: "",
    year_level: "",
    address: "",
    contact_number: "",
    password: "",
    student_id: "",
    confirmPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);
  const [studentIdError, setStudentIdError] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  async function signUpNewUser() {
    const user = JSON.parse(JSON.stringify(values));

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    console.log(data);

    delete user.password;
    delete user.confirmPassword;
    delete user.username;

    const { error: student_error } = await supabase
      .from("students")
      .insert(user);

    console.log(student_error, error);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (values.password !== values.confirmPassword) {
      Swal.fire({
        title: "Error!",
        text: "Passwords do not match.",
        icon: "error",
      });
    } else if (!validatePassword(values.password)) {
      Swal.fire({
        title: "Error!",
        text: "Password must contain at least eight characters, including at least one number, and include both lower and uppercase letters and special characters.",
        icon: "error",
      });
    } else {
      signUpNewUser();
      // const backendpoint = "http://localhost:4000/register/signup";
      // axios
      //   .post(backendpoint, values)
      //   .then((res) => {
      //     console.log(res);
      //     if (res.status === 200) {
      //       Swal.fire({
      //         title: "Success!",
      //         text: "Registration Successful.",
      //         icon: "success",
      //         timer: 1500,
      //         timerProgressBar: true,
      //         didClose: () => {
      //           window.location.reload();
      //         },
      //       });
      //     }
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     if (err.response && err.response.status === 400) {
      //       setStudentIdError(true);
      //       Swal.fire({
      //         title: "Error!",
      //         text: "Student is already registered.",
      //         icon: "error",
      //       });
      //     }
      //   });
    }
  };

  return (
    <div className="registration-container">
      <h2>Student Registration</h2>
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label>
            <FaBook /> Student ID
          </label>
          <input
            type="text"
            onChange={(e) =>
              setValues({ ...values, student_id: e.target.value })
            }
            required
            className={`input-field ${studentIdError ? "invalid" : ""}`}
          />
        </div>
        <div className="form-group">
          <label>
            <FaUser /> Name
          </label>
          <input
            type="text"
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>
            <FaUser /> Username
          </label>
          <input
            type="text"
            onChange={(e) => setValues({ ...values, username: e.target.value })}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Course</label>
          <input
            type="text"
            onChange={(e) => setValues({ ...values, course: e.target.value })}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Year Level</label>
          <select
            onChange={(e) =>
              setValues({ ...values, year_level: e.target.value })
            }
            required
            className="input-field"
          >
            <option value="">Select Year Level</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            onChange={(e) => setValues({ ...values, address: e.target.value })}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Contact Number</label>
          <input
            type="number"
            onChange={(e) =>
              setValues({ ...values, contact_number: e.target.value })
            }
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="label">
            <FaLock /> Password
          </label>
          <div className="input-icon">
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              onChange={(e) => {
                setValues({ ...values, password: e.target.value });
                setPasswordValid(validatePassword(e.target.value));
              }}
              value={values.password}
              required
              className={`input-field ${!passwordValid ? "invalid" : ""}`}
            />
            <span className="icon" onClick={togglePasswordVisibility}>
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {!passwordValid && (
            <p className="password-error">
              Password must contain at least eight characters, including at
              least one number, and include both lower and uppercase letters and
              special characters.
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword" className="label">
            Confirm Password
          </label>
          <div className="input-icon">
            <input
              type={passwordVisible ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              onChange={(e) =>
                setValues({ ...values, confirmPassword: e.target.value })
              }
              value={values.confirmPassword}
              required
              className={`input-field ${
                values.password === values.confirmPassword ? "" : "invalid"
              }`}
            />
            <span className="icon" onClick={togglePasswordVisibility}>
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {values.password !== values.confirmPassword && (
            <p className="password-error">Passwords do not match.</p>
          )}
        </div>
        <button type="submit" className="register-button">
          Register
        </button>
        <p>
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default StudentRegistration;
