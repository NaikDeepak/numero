import React, { useState } from 'react';
// Removed import { calculateNumerologyData } from '../numerologyUtils';
import NumerologyGrid from '../NumerologyGrid'; // Adjust path

// Define API URL (adjust if your backend runs elsewhere)
const API_URL = 'http://localhost:3001/api/calculate';

// Helper function to fetch data from the API
async function fetchNumerologyData(dob, gender) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dob, gender }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API Error (${response.status}):`, errorData.error || 'Unknown error');
      return null; // Indicate failure
    }
    return await response.json(); // Return calculated data
  } catch (error) {
    console.error('Network or fetch error:', error);
    alert('Failed to connect to the calculation API. Please ensure the backend server is running.');
    return null; // Indicate failure
  }
}


function CompatibilityChecker() {
  // State for Person 1
  const [person1Name, setPerson1Name] = useState('');
  const [person1Dob, setPerson1Dob] = useState('');
  const [person1Gender, setPerson1Gender] = useState('Male');
  const [person1Data, setPerson1Data] = useState(null);

  // State for Person 2
  const [person2Name, setPerson2Name] = useState('');
  const [person2Dob, setPerson2Dob] = useState('');
  const [person2Gender, setPerson2Gender] = useState('Female');
  const [person2Data, setPerson2Data] = useState(null);

  // State for compatibility report
  const [compatibilityReport, setCompatibilityReport] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleCalculateCompatibility = async () => { // Made async
    // Basic validation
    if (!person1Name || !person1Dob || !person2Name || !person2Dob) {
      alert("Please enter details for both individuals.");
      return;
    }

    setIsLoading(true); // Start loading
    setPerson1Data(null); // Clear previous data
    setPerson2Data(null);
    setCompatibilityReport(''); // Clear previous report

    // Fetch data for both persons concurrently
    const [data1, data2] = await Promise.all([
      fetchNumerologyData(person1Dob, person1Gender),
      fetchNumerologyData(person2Dob, person2Gender)
    ]);

    setPerson1Data(data1); // Set fetched data (could be null on error)
    setPerson2Data(data2);

    // --- Placeholder for Compatibility Logic ---
    // TODO: Implement actual compatibility rules based on user requirements
    if (data1 && data2) {
        // Example: Simple comparison (replace with actual logic)
        let report = `Compatibility Analysis for ${person1Name} and ${person2Name}:\n\n`;
        report += `Person 1 Bhagyank: ${data1.bhagyank}, Person 2 Bhagyank: ${data2.bhagyank}\n`;
        report += `Person 1 Moolank: ${data1.moolank}, Person 2 Moolank: ${data2.moolank}\n`;
        report += `Person 1 Kua: ${data1.kua}, Person 2 Kua: ${data2.kua}\n\n`;
        report += `(Detailed compatibility report based on specific rules will be generated here.)`;
        setCompatibilityReport(report);
    } else {
        setCompatibilityReport("Could not calculate compatibility due to invalid input or API error for one or both individuals.");
    }
    // --- End Placeholder ---

    setIsLoading(false); // End loading
  };

  return (
    <>
      <h2>Numerology Compatibility Checker</h2>

      <div className="compatibility-container">
        {/* Person 1 Input */}
        <div id="person1Input" className="person-input-section">
          <h3>Person 1 Details</h3>
          <label>Name:
            <input type="text" value={person1Name} onChange={(e) => setPerson1Name(e.target.value)} placeholder="Person 1 Name" />
          </label>
          <label>DOB:
            <input type="date" value={person1Dob} onChange={(e) => setPerson1Dob(e.target.value)} />
          </label>
          <label>Gender:
            <select value={person1Gender} onChange={(e) => setPerson1Gender(e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          {/* Display Person 1 Grid and Data */}
          {isLoading && <p>Loading Person 1 data...</p>}
          {!isLoading && person1Data && (
            <div className="grid-display">
              <h4>{person1Name}'s Grid</h4>
              <NumerologyGrid gridNumbers={person1Data.gridNumbers} />
              <p>Bhagyank: {person1Data.bhagyank}, Moolank: {person1Data.moolank}, Kua: {person1Data.kua}</p>
            </div>
          )}
           {!isLoading && !person1Data && person1Dob && <p className="error-message">Could not load data for Person 1.</p>}
        </div>

        {/* Person 2 Input */}
        <div id="person2Input" className="person-input-section">
          <h3>Person 2 Details</h3>
          <label>Name:
            <input type="text" value={person2Name} onChange={(e) => setPerson2Name(e.target.value)} placeholder="Person 2 Name" />
          </label>
          <label>DOB:
            <input type="date" value={person2Dob} onChange={(e) => setPerson2Dob(e.target.value)} />
          </label>
          <label>Gender:
            <select value={person2Gender} onChange={(e) => setPerson2Gender(e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          {/* Display Person 2 Grid and Data */}
          {isLoading && <p>Loading Person 2 data...</p>}
          {!isLoading && person2Data && (
            <div className="grid-display">
              <h4>{person2Name}'s Grid</h4>
              <NumerologyGrid gridNumbers={person2Data.gridNumbers} />
               <p>Bhagyank: {person2Data.bhagyank}, Moolank: {person2Data.moolank}, Kua: {person2Data.kua}</p>
            </div>
          )}
          {!isLoading && !person2Data && person2Dob && <p className="error-message">Could not load data for Person 2.</p>}
        </div>
      </div>

      {/* Calculate Button */}
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <button onClick={handleCalculateCompatibility} disabled={isLoading}>
          {isLoading ? 'Calculating...' : 'Calculate Compatibility'}
        </button>
      </div>

      {/* Compatibility Report Area */}
      {/* Show report only when not loading and report exists */}
      {!isLoading && compatibilityReport && (
        <div id="compatibilityReport" className="report-section">
          <h3>Compatibility Report</h3>
          <pre>{compatibilityReport}</pre> {/* Use pre for basic formatting */}
        </div>
      )}
    </>
  );
}

export default CompatibilityChecker;
