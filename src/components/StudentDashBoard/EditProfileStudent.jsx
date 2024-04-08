import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './EditProfileStudent.css';
import { FaHome, FaUserEdit,  FaSignOutAlt } from 'react-icons/fa';

const EditProfileStudent = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    password: '',
    confirmPassword: '',
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

 
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  
  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Old Password:', formData.oldPassword);
    console.log('New Password:', formData.password);
  };

  return (
    <div>
      <header>
        <h1 className="student-header">Student Attendance System</h1>
        <div className="student-logout-link">
          <div className="dropdown">
            <div onClick={toggleDropdown} className="drop-trigger">
              Menu
            </div>
            {dropdownOpen && (
              <div className="dropdown-content">
                <NavLink to="/studentdashboard" onClick={closeDropdown}>
                  <FaHome/> Home
                </NavLink>
                <NavLink to="edit-profile-student" onClick={closeDropdown}>
                  <FaUserEdit/> Edit Profile
                </NavLink>
                <Link to="/" onClick={closeDropdown}>
                  <FaSignOutAlt/> Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="edit-profile-container">
        <h2>Change Password</h2>
        <form className="edit-student-form" onSubmit={handleSubmit}>
          <label htmlFor="oldPassword">Old Password:</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
          />

          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button className="edit-student-button" type="submit">
            Save Changes
          </button>
         
        </form>
        
      </div>
      <div className="footer">
       <h6>© 2023 School Attendance System. All rights reserved.</h6> 
      </div>
   
    
    </div>
  );
};

export default EditProfileStudent;
