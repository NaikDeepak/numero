import React from "react";
import PropTypes from "prop-types";
import { GiGalaxy } from "react-icons/gi"; // Example icon

function Header({ theme, handleThemeChange }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="title-container">
          <GiGalaxy className="header-icon" aria-hidden="true" />
          <h1>Numerology Insights</h1>
        </div>
        <div className="theme-switch-wrapper">
          <label className="theme-switch" htmlFor="themeToggleCheckbox">
            <input
              type="checkbox"
              id="themeToggleCheckbox"
              onChange={handleThemeChange}
              checked={theme === "light"}
            />
            <div className="slider round"></div>
          </label>
          <span className="theme-toggle-label">Toggle Theme</span>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  theme: PropTypes.string.isRequired,
  handleThemeChange: PropTypes.func.isRequired,
};

export default Header;
