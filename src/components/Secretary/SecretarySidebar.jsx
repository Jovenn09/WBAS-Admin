import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SecretarySidebar.css";
import { NavLink } from "react-router-dom";
import {
  FaLongArrowAltRight,
  FaLongArrowAltLeft,
  FaUserGraduate,
  FaBook,
  FaSignOutAlt,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { GiBookshelf } from "react-icons/gi";
import { SiGoogleclassroom } from "react-icons/si";
import Swal from "sweetalert2";
import supabase from "../../config/supabaseClient";
import { AuthContext } from "../../context/AuthContext";
import { MdSupervisorAccount } from "react-icons/md";

const SecretarySidebar = () => {
  const { setUser } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true" || false
  );

  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setCollapsed(false);
        localStorage.setItem("sidebarCollapsed", "false");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem("sidebarCollapsed", newCollapsed.toString());
  };

  const iconStyle = { marginRight: "8px" };

  async function onLogout(e) {
    e.preventDefault();
    const { isConfirmed } = await Swal.fire({
      title: "Log out",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      reverseButton: true,
    });
    if (isConfirmed) {
      setUser(null);
      supabase.auth.signOut();
    }
  }

  return (
    <div className={`secretary-sidebar ${collapsed ? "collapsed" : ""}`}>
      <button onClick={toggleSidebar} className="toggle-button">
        {collapsed ? <FaLongArrowAltRight /> : <FaLongArrowAltLeft />}
      </button>
      <div className="sidebar-content">
        {!collapsed && (
          <div className="welcome-message">Welcome, Admin {username}!</div>
        )}
        <ul>
          <li>
            <NavLink
              to="/admin-sidebar/assign-students"
              activeClassName="active"
            >
              <FaUserGraduate style={iconStyle} />
              Assign Students
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin-sidebar/list-of-students"
              activeClassName="active"
            >
              <FaBook style={iconStyle} />
              Instructor Handles
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin-sidebar/teacher-account"
              activeClassName="active"
            >
              <FaChalkboardTeacher style={iconStyle} />
              Teacher Account
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin-sidebar/subjects" activeClassName="active">
              <GiBookshelf style={iconStyle} />
              Subjects
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin-sidebar/student-account"
              activeClassName="active"
            >
              <MdSupervisorAccount style={iconStyle} />
              Student Account
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin-sidebar/section-management"
              activeClassName="active"
            >
              <SiGoogleclassroom style={iconStyle} />
              Sections
            </NavLink>
          </li>
          <li>
            <a onClick={onLogout} style={{ color: "white" }} to="/">
              <FaSignOutAlt style={iconStyle} />
              Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SecretarySidebar;
