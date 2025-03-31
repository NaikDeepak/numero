import React, { useState } from 'react';
import { calculateNumerologyData } from '../numerologyUtils'; // Adjust path
import NumerologyGrid from '../NumerologyGrid'; // Adjust path

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

  const handleCalculateCompatibility = () => {
    // Basic validation
    if (!person1Name || !person1Dob || !person2Name || !person2Dob) {
      alert("Please enter details for both individuals.");
      return;
    }

    const data1 = calculateNumerologyData(person1Dob, person1Gender);
    const data2 = calculateNumerologyData(person2Dob, person2Gender);

    setPerson1Data(data1);
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
        setCompatibilityReport("Could not calculate compatibility due to invalid input for one or both individuals.");
    }
    // --- End Placeholder ---
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
          {person1Data && (
            <div className="grid-display">
              <h4>{person1Name}'s Grid</h4>
              <NumerologyGrid gridNumbers={person1Data.gridNumbers} />
              <p>Bhagyank: {person1Data.bhagyank}, Moolank: {person1Data.moolank}, Kua: {person1Data.kua}</p>
            </div>
          )}
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
           {person2Data && (
            <div className="grid-display">
              <h4>{person2Name}'s Grid</h4>
              <NumerologyGrid gridNumbers={person2Data.gridNumbers} />
               <p>Bhagyank: {person2Data.bhagyank}, Moolank: {person2Data.moolank}, Kua: {person2Data.kua}</p>
            </div>
          )}
        </div>
      </div>

      {/* Calculate Button */}
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <button onClick={handleCalculateCompatibility}>Calculate Compatibility</button>
      </div>

      {/* Compatibility Report Area */}
      {compatibilityReport && (
        <div id="compatibilityReport" className="report-section">
          <h3>Compatibility Report</h3>
          <pre>{compatibilityReport}</pre> {/* Use pre for basic formatting */}
        </div>
      )}
    </>
  );
}

export default CompatibilityChecker;
