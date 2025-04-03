import React, { useState } from "react"; // Import useState
import { NavLink } from "react-router-dom";
import { FaTable, FaUsers, FaTrophy, FaBars, FaTimes } from "react-icons/fa"; // Added FaBars, FaTimes

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`app-navbar ${isMenuOpen ? "menu-open" : ""}`}>
      {" "}
      {/* Add conditional class */}
      {/* Hamburger Menu Toggle Button */}
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
      {/* Navigation Links - Add conditional 'active' class */}
      <ul className={`app-navbar-nav ${isMenuOpen ? "active" : ""}`}>
        <li className="app-nav-item">
          <NavLink
            to="/"
            onClick={closeMenu} // Close menu on link click
            className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}
            end // Use 'end' prop for the home route
          >
            <FaTable className="nav-icon" aria-hidden="true" />
            <span>Grid Calculator</span>
          </NavLink>
        </li>
        <li className="app-nav-item">
          <NavLink
            to="/compatibility"
            onClick={closeMenu} // Close menu on link click
            className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}
          >
            <FaUsers className="nav-icon" aria-hidden="true" />
            <span>Compatibility</span>
          </NavLink>
        </li>
        <li className="app-nav-item">
          <NavLink
            to="/win-percentage"
            onClick={closeMenu} // Close menu on link click
            className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}
          >
            <FaTrophy className="nav-icon" aria-hidden="true" />
            <span>Team Win %</span>
          </NavLink>
        </li>
        {/* Add more navigation links here if needed */}
      </ul>
    </nav>
  );
}

export default Navbar;
