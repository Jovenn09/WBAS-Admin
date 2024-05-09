import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TeacherSidebar.css";
import { NavLink } from "react-router-dom";
import {
  FaLongArrowAltRight,
  FaLongArrowAltLeft,
  FaTachometerAlt,
  FaCalendarCheck,
  FaUsers,
  FaClipboardList,
  FaUserEdit,
  FaSignOutAlt,
} from "react-icons/fa";
import supabase from "../../config/supabaseClient";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";

const TeacherSidebar = () => {
  const { user, setUser } = useContext(AuthContext);

  const [teacherName, setTeacherName] = useState("");

  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true" || false
  );

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem("sidebarCollapsed", newCollapsed.toString());
  };

  useEffect(() => {
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

  async function onLogout() {
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

  const iconStyle = { marginRight: "8px" };

  async function getTeacherName() {
    const { data, error } = await supabase
      .from("teachers")
      .select("name")
      .eq("uuid", user.id);

    if (error) return console.log(error.message);

    setTeacherName(data[0].name);
  }

  useEffect(() => {
    getTeacherName();
  }, [user]);

  return (
    <div className={`teacher-sidebar ${collapsed ? "collapsed" : ""}`}>
      <button onClick={toggleSidebar} className="toggle-button">
        {collapsed ? <FaLongArrowAltRight /> : <FaLongArrowAltLeft />}
      </button>
      <div className="sidebar-content">
        {!collapsed && <div className="welcome-message">{teacherName}</div>}
        <ul>
          <li>
            <NavLink to="/teacher-sidebar/dashboard" activeClassName="active">
              <FaTachometerAlt style={iconStyle} />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/teacher-sidebar/attendance" activeClassName="active">
              <FaCalendarCheck style={iconStyle} />
              Attendance
            </NavLink>
          </li>
          <li>
            <NavLink to="/teacher-sidebar/students" activeClassName="active">
              <FaUsers style={iconStyle} />
              Students
            </NavLink>
          </li>
          <li>
            <NavLink to="/teacher-sidebar/reports" activeClassName="active">
              <FaClipboardList style={iconStyle} />
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/teacher-sidebar/edit-profile"
              activeClassName="active"
            >
              <FaUserEdit style={iconStyle} />
              Edit Profile
            </NavLink>
          </li>
          <li>
            <a onClick={onLogout} className="logout-btn">
              <FaSignOutAlt style={iconStyle} />
              Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TeacherSidebar;
