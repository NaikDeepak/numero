import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // Import new Header
import Navbar from './Navbar';
import Footer from './components/Footer'; // Import new Footer
import GridCalculator from './pages/GridCalculator';
import CompatibilityChecker from './pages/CompatibilityChecker';
import TeamWinPercentage from './pages/TeamWinPercentage'; // Import the new page

function App() {
  // State for theme (initialize from localStorage or default to 'dark')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Effect to apply theme class to body and update localStorage
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Function to handle theme toggle
  const handleThemeChange = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container"> {/* Optional: Add a main container */}
      {/* Use the new Header component, passing theme state and handler */}
      <Header theme={theme} handleThemeChange={handleThemeChange} />

      {/* Navbar is now below the Header */}
      <Navbar />

      <main className="main-content">
        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<GridCalculator />} />
          <Route path="/compatibility" element={<CompatibilityChecker />} />
          <Route path="/win-percentage" element={<TeamWinPercentage />} /> {/* Add route */}
          {/* Add other routes here if needed */}
        </Routes>
      </main>

      {/* Use the new Footer component */}
      <Footer />
    </div>
  );
}

export default App;
