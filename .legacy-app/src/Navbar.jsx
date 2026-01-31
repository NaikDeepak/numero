import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo"></div>
        <button className="navbar-toggle" onClick={toggleDrawer} aria-label="Toggle menu">
          {isDrawerOpen ? <FaTimes /> : <FaBars />}
        </button>
        <ul className={`navbar-links ${isDrawerOpen ? "drawer-open" : ""}`}>
          <li>
            <NavLink to="/" onClick={closeDrawer} className="navbar-link" end>
              Grid Calculator
            </NavLink>
          </li>
          <li>
            <NavLink to="/compatibility" onClick={closeDrawer} className="navbar-link">
              Compatibility
            </NavLink>
          </li>
          <li>
            <NavLink to="/win-percentage" onClick={closeDrawer} className="navbar-link">
              Team Win %
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
