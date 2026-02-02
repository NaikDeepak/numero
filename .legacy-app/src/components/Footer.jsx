import React from "react";
import { FaRegCopyright } from "react-icons/fa"; // Example icon

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <FaRegCopyright aria-hidden="true" />
        <span>&nbsp;{new Date().getFullYear()} Numerology Insights. All rights reserved.</span>
        {/* Add other footer links or info if needed */}
      </div>
    </footer>
  );
}

export default Footer;
