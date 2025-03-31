import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTable, FaUsers } from 'react-icons/fa'; // Example icons

function Navbar() {
  return (
    <nav className="app-navbar">
      <ul className="app-navbar-nav">
        <li className="app-nav-item">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'app-nav-link active' : 'app-nav-link')}
            end // Use 'end' prop for the home route
          >
            <FaTable className="nav-icon" aria-hidden="true" />
            <span>Grid Calculator</span>
          </NavLink>
        </li>
        <li className="app-nav-item">
          <NavLink
            to="/compatibility"
            className={({ isActive }) => (isActive ? 'app-nav-link active' : 'app-nav-link')}
          >
            <FaUsers className="nav-icon" aria-hidden="true" />
            <span>Compatibility</span>
          </NavLink>
        </li>
        {/* Add more navigation links here if needed */}
      </ul>
    </nav>
  );
}

export default Navbar;
