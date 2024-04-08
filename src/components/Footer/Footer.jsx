import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <div className="copyright-footer">
      <h6>
        &copy; {new Date().getFullYear()} COLLEGE OF INFORMATION TECHNOLOGY
        School Attendance System. All rights reserved.
      </h6>
    </div>
  );
};

export default Footer;
