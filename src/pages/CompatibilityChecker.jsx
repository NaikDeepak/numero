import React, { useState } from 'react';
import NumerologyGrid from '../NumerologyGrid'; // Adjust path

// Import the necessary JSON data files directly
// Adjust paths if your project structure is different
import compatibilityRules from '../../api/data/compatibilityData.json';
import houseMeanings from '../../api/data/houseMeanings.json';
import moolankBhagyankRelations from '../../api/data/moolankBhagyankRelations.json';


// Read BASE API URL from environment variable, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to fetch data from the API
async function fetchNumerologyData(dob, gender) {
  try {
    const response = await fetch(`${API_BASE_URL}/calculate`, { // Append endpoint path
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

  // State for detailed compatibility results
  const [compatibilityDetails, setCompatibilityDetails] = useState(null); // Store score, breakdown, etc.
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Helper function to get relationship type
  const getRelationship = (num1, num2) => {
    const rules1 = compatibilityRules[num1];
    if (!rules1) return "Neutral (No data)";
    if (rules1.friendly?.includes(num2)) return "Friendly";
    if (rules1.enemy?.includes(num2)) return "Enemy";
    return "Neutral";
  };

  // Helper function to calculate score between two numbers
  const getScore = (num1, num2) => {
      const rules1 = compatibilityRules[num1];
      if (!rules1) return 1; // Default to neutral if rules missing for num1
      if (rules1.friendly?.includes(num2)) return 3;
      if (rules1.enemy?.includes(num2)) return 0;
      return 1; // Neutral
  };


  const handleCalculateCompatibility = async () => { // Made async
    // Basic validation
    if (!person1Name || !person1Dob || !person2Name || !person2Dob) {
      alert("Please enter details for both individuals.");
      return;
    }

    setIsLoading(true); // Start loading
    setPerson1Data(null); // Clear previous data
    setPerson2Data(null);
    setCompatibilityDetails(null); // Clear previous details

    // Fetch data for both persons concurrently
    const [data1, data2] = await Promise.all([
      fetchNumerologyData(person1Dob, person1Gender),
      fetchNumerologyData(person2Dob, person2Gender)
    ]);

    setPerson1Data(data1); // Set fetched data (could be null on error)
    setPerson2Data(data2);

    // --- Calculate Compatibility Details ---
    if (data1 && data2) {
        const m1 = data1.moolank;
        const b1 = data1.bhagyank;
        const m2 = data2.moolank;
        const b2 = data2.bhagyank;

        // Calculate individual scores for all 8 comparisons (bidirectional)
        // P1 -> P2
        const scoreM1M2 = getScore(m1, m2);
        const scoreB1B2 = getScore(b1, b2);
        const scoreM1B2 = getScore(m1, b2);
        const scoreB1M2 = getScore(b1, m2);
        // P2 -> P1
        const scoreM2M1 = getScore(m2, m1);
        const scoreB2B1 = getScore(b2, b1);
        const scoreM2B1 = getScore(m2, b1);
        const scoreB2M1 = getScore(b2, m1);


        // Calculate total score and percentage based on 8 comparisons
        const totalScore = scoreM1M2 + scoreB1B2 + scoreM1B2 + scoreB1M2 +
                           scoreM2M1 + scoreB2B1 + scoreM2B1 + scoreB2M1;
        const maxScore = 24; // 8 comparisons * 3 points max
        const percentage = Math.round((totalScore / maxScore) * 100);

        // Get relationship types for all 8 comparisons (bidirectional)
        // P1 -> P2
        const relationM1M2 = getRelationship(m1, m2);
        const relationB1B2 = getRelationship(b1, b2);
        const relationM1B2 = getRelationship(m1, b2);
        const relationB1M2 = getRelationship(b1, m2);
        // P2 -> P1
        const relationM2M1 = getRelationship(m2, m1);
        const relationB2B1 = getRelationship(b2, b1);
        const relationM2B1 = getRelationship(m2, b1);
        const relationB2M1 = getRelationship(b2, m1);

        // Get individual Moolank-Bhagyank relations
        const person1MBRelation = moolankBhagyankRelations[m1]?.[b1] || { rating: 'N/A', indication: 'No specific data' };
        const person2MBRelation = moolankBhagyankRelations[m2]?.[b2] || { rating: 'N/A', indication: 'No specific data' };

        // Determine final verdict: Override if any of the 8 relationships is "Enemy"
        let finalVerdict = "";
        const allRelations = [
            relationM1M2, relationB1B2, relationM1B2, relationB1M2,
            relationM2M1, relationB2B1, relationM2B1, relationB2M1
        ];
        if (allRelations.includes("Enemy")) {
            finalVerdict = "Not Compatible (Due to Enemy Relationship)";
        } else {
            // Otherwise, use percentage-based interpretation (based on new maxScore)
            if (percentage >= 75) finalVerdict = "High Compatibility";
            else if (percentage <= 35) finalVerdict = "Low Compatibility";
            else finalVerdict = "Average Compatibility";
        }


        setCompatibilityDetails({
            score: totalScore,
            maxScore: maxScore,
            percentage: percentage,
            interpretation: finalVerdict, // Use the final verdict here
            // Include all 8 breakdown items
            breakdown: [
                // P1 -> P2
                { p1: `Moolank (${m1})`, p2: `Moolank (${m2})`, relation: relationM1M2, score: scoreM1M2 },
                { p1: `Bhagyank (${b1})`, p2: `Bhagyank (${b2})`, relation: relationB1B2, score: scoreB1B2 },
                { p1: `Moolank (${m1})`, p2: `Bhagyank (${b2})`, relation: relationM1B2, score: scoreM1B2 },
                { p1: `Bhagyank (${b1})`, p2: `Moolank (${m2})`, relation: relationB1M2, score: scoreB1M2 },
                 // P2 -> P1
                { p1: `Moolank (${m2})`, p2: `Moolank (${m1})`, relation: relationM2M1, score: scoreM2M1 },
                { p1: `Bhagyank (${b2})`, p2: `Bhagyank (${b1})`, relation: relationB2B1, score: scoreB2B1 },
                { p1: `Moolank (${m2})`, p2: `Bhagyank (${b1})`, relation: relationM2B1, score: scoreM2B1 },
                { p1: `Bhagyank (${b2})`, p2: `Moolank (${m1})`, relation: relationB2M1, score: scoreB2M1 },
            ],
            person1: {
                name: person1Name,
                moolank: m1,
                moolankMeaning: houseMeanings[m1] || 'N/A',
                bhagyank: b1,
                bhagyankMeaning: houseMeanings[b1] || 'N/A',
                mbRelation: person1MBRelation,
            },
            person2: {
                name: person2Name,
                moolank: m2,
                moolankMeaning: houseMeanings[m2] || 'N/A',
                bhagyank: b2,
                bhagyankMeaning: houseMeanings[b2] || 'N/A',
                mbRelation: person2MBRelation,
            }
        });

    } else {
        // Handle case where data fetching failed for one or both
        setCompatibilityDetails({ error: "Could not calculate compatibility due to invalid input or API error for one or both individuals." });
    }
    // --- End Calculation ---

    setIsLoading(false); // End loading
  };

  // --- Function to handle PDF Download ---
  const handleDownloadCompatibilityPdf = async () => {
    // Ensure data is available
    if (!person1Data || !person2Data || !person1Name || !person2Name || !person1Dob || !person2Dob) {
      alert("Cannot download report. Please calculate compatibility first and ensure all details are filled.");
      return;
    }

    // Construct the URL for the PDF endpoint
    const params = new URLSearchParams({
        dob1: person1Dob,
        gender1: person1Gender,
        name1: person1Name,
        dob2: person2Dob,
        gender2: person2Gender,
        name2: person2Name,
    });
    const pdfUrl = `${API_BASE_URL}/report/compatibility/pdf?${params.toString()}`;

    try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            // Try to get error message from backend response
            let errorMsg = `PDF download failed: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch (e) { /* Ignore if response is not JSON */ }
            throw new Error(errorMsg);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // Create a filename (e.g., Compatibility_Report_Alice_Bob.pdf)
        const filename = `Compatibility_Report_${person1Name.replace(/ /g, '_')}_${person2Name.replace(/ /g, '_')}.pdf`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

    } catch (error) {
        console.error('PDF Download error:', error);
        alert(`Failed to download PDF report: ${error.message}`);
    }
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

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', margin: '30px 0', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button onClick={handleCalculateCompatibility} disabled={isLoading}>
          {isLoading ? 'Calculating...' : 'Calculate Compatibility'}
        </button>
        {/* Add Download PDF Button - Enabled only when data is loaded */}
        <button
          onClick={handleDownloadCompatibilityPdf}
          disabled={isLoading || !person1Data || !person2Data}
          title={!person1Data || !person2Data ? "Calculate compatibility first" : "Download PDF Report"}
         >
          Download PDF Report
        </button>
      </div>

      {/* Compatibility Report Area */}
      {!isLoading && compatibilityDetails && (
        <div id="compatibilityReport" className="report-section compatibility-details">
          <h3>Compatibility Analysis</h3>
          {compatibilityDetails.error ? (
            <p className="error-message">{compatibilityDetails.error}</p>
          ) : (
            <>
              {/* Overall Score */}
              <div className="overall-score">
                <strong>Overall Compatibility Score: </strong>
                {compatibilityDetails.score} / {compatibilityDetails.maxScore} ({compatibilityDetails.percentage}%)
                <br />
                <strong>General Indication: </strong> {compatibilityDetails.interpretation}
              </div>

              {/* Relationship Breakdown Table */}
              <h4>Relationship Breakdown:</h4>
              <table className="compatibility-table">
                <thead>
                  <tr>
                    <th>Number 1</th>
                    <th>Number 2</th>
                    <th>Relationship</th>
                    <th>Score (0-3)</th>
                  </tr>
                </thead>
                <tbody>
                  {compatibilityDetails.breakdown.map((item, index) => (
                    <tr key={index}>
                      <td>{item.p1}</td>
                      <td>{item.p2}</td>
                      <td>{item.relation}</td>
                      <td>{item.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Individual Details */}
              <div className="individual-details-container">
                 {/* Person 1 Details */}
                <div className="individual-details">
                    <h4>{person1Name}'s Numerology Profile</h4>
                    <p><strong>Moolank:</strong> {compatibilityDetails.person1.moolank} ({compatibilityDetails.person1.moolankMeaning})</p>
                    <p><strong>Bhagyank:</strong> {compatibilityDetails.person1.bhagyank} ({compatibilityDetails.person1.bhagyankMeaning})</p>
                    <p><strong>Moolank-Bhagyank Relation ({compatibilityDetails.person1.moolank}-{compatibilityDetails.person1.bhagyank}):</strong> {compatibilityDetails.person1.mbRelation.indication} (Rating: {compatibilityDetails.person1.mbRelation.rating})</p>
                </div>
                 {/* Person 2 Details */}
                 <div className="individual-details">
                    <h4>{person2Name}'s Numerology Profile</h4>
                    <p><strong>Moolank:</strong> {compatibilityDetails.person2.moolank} ({compatibilityDetails.person2.moolankMeaning})</p>
                    <p><strong>Bhagyank:</strong> {compatibilityDetails.person2.bhagyank} ({compatibilityDetails.person2.bhagyankMeaning})</p>
                    <p><strong>Moolank-Bhagyank Relation ({compatibilityDetails.person2.moolank}-{compatibilityDetails.person2.bhagyank}):</strong> {compatibilityDetails.person2.mbRelation.indication} (Rating: {compatibilityDetails.person2.mbRelation.rating})</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default CompatibilityChecker;
