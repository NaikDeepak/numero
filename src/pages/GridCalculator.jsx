import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import * as XLSX from "xlsx";
import NumerologyGrid from "../NumerologyGrid"; // Adjust path
// Import icons for Moolank details
import { FaStar, FaThumbsUp, FaThumbsDown, FaLightbulb } from "react-icons/fa";

// Read BASE API URL from environment variable, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Helper function to fetch data from the API (now includes name)
async function fetchNumerologyData(dob, gender, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/calculate`, {
      // Append endpoint path
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Include name in the request body
      body: JSON.stringify({ dob, gender, name }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API Error (${response.status}):`, errorData.error || "Unknown error");
      return null; // Indicate failure
    }
    return await response.json(); // Return calculated data
  } catch (error) {
    console.error("Network or fetch error:", error);
    alert("Failed to connect to the calculation API. Please ensure the backend server is running.");
    return null; // Indicate failure
  }
}

function GridCalculator() {
  // State for input fields (name was already here, good!)
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male"); // Default gender

  // State for the list of users (stores only basic info now)
  const [usersData, setUsersData] = useState([]);
  // State to hold calculated data for display in the table
  const [calculatedUsersData, setCalculatedUsersData] = useState({}); // { userId: { moolank: ..., bhagyank: ..., report: ... }, ... }

  // Function to add a new user (includes name validation)
  const addUser = () => {
    // Basic validation - ensure name is also entered
    const trimmedName = name.trim();
    if (!trimmedName || !dob) {
      alert("Please enter Full Name and Date of Birth.");
      return;
    }
    // Optional: Add more specific name validation if needed (e.g., check for letters)
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      alert("Please enter a valid name containing only letters and spaces.");
      return;
    }

    const newUser = {
      id: Date.now(), // Simple unique ID using timestamp
      name: trimmedName, // Use trimmed name
      dob: dob,
      gender: gender,
    };

    setUsersData((prevUsers) => [...prevUsers, newUser]); // Add new user to the list

    // Clear input fields
    setName(""); // Clear name field
    setDob("");
    setGender("Male"); // Reset gender to default
    // No immediate calculation needed here
  };

  // Function to fetch and update calculated data for a specific user
  // Using useCallback to memoize the function for stability in UserTableRow useEffect dependency
  const getOrFetchUserData = React.useCallback(
    async (user) => {
      if (calculatedUsersData[user.id]) {
        return calculatedUsersData[user.id]; // Return cached data
      }

      // Pass user.name to the fetch function
      const data = await fetchNumerologyData(user.dob, user.gender, user.name);
      if (data) {
        setCalculatedUsersData((prevData) => ({
          ...prevData,
          [user.id]: data, // Cache the fetched data
        }));
        return data;
      }
      // Return an object indicating error for consistent handling in UserTableRow
      // Include nameNumerology: null in the error structure
      return {
        moolank: "Error",
        bhagyank: "Error",
        kua: "Error",
        gridNumbers: null,
        nameNumerology: null,
      };
    },
    [calculatedUsersData] // Dependency remains the same
  ); // Dependency: re-create if cache changes (though unlikely needed here)

  // Function to export data to Excel (fetches all data first)
  const exportToExcel = async () => {
    // Made async
    if (usersData.length === 0) {
      alert("Please add at least one user before exporting.");
      return;
    }

    // Define detailed headers for the Excel sheet, including individual grid cells
    const headers = [
      "Name",
      "Date of Birth",
      "Gender",
      "Bhagyank",
      "Moolank",
      "Kua",
      "Grid 4",
      "Grid 9",
      "Grid 2", // Top row
      "Grid 3",
      "Grid 5",
      "Grid 7", // Middle row
      "Grid 8",
      "Grid 1",
      "Grid 6", // Bottom row
      "Destiny No.", // New header
      "Soul Urge No.", // New header
      "Personality No.", // New header
      // Removed "Report" header
    ];

    // Map Lo Shu grid numbers to their corresponding header names
    const positionToHeaderMap = {
      4: "Grid 4",
      9: "Grid 9",
      2: "Grid 2",
      3: "Grid 3",
      5: "Grid 5",
      7: "Grid 7",
      8: "Grid 8",
      1: "Grid 1",
      6: "Grid 6",
    };
    // Create a reverse map for easy index lookup
    const headerToIndexMap = {};
    headers.forEach((h, i) => {
      headerToIndexMap[h] = i;
    });

    // Fetch calculated data for all users concurrently
    alert("Calculating data for export... Please wait."); // Inform user
    const calculatedDataPromises = usersData.map((user) =>
      // Pass user.name to fetchNumerologyData for export
      fetchNumerologyData(user.dob, user.gender, user.name).then((data) => ({ user, data }))
    );

    const results = await Promise.all(calculatedDataPromises);
    alert("Calculation complete. Preparing Excel file."); // Inform user

    // Process results to create export data
    const dataToExport = results.map(({ user, data: calculatedData }) => {
      // Initialize row data with empty strings matching headers length
      const rowData = new Array(headers.length).fill("");

      if (calculatedData) {
        // Populate basic info and calculated numbers
        rowData[headerToIndexMap["Name"]] = user.name || "";
        rowData[headerToIndexMap["Date of Birth"]] = user.dob || "";
        rowData[headerToIndexMap["Gender"]] = user.gender || "";
        // Ensure calculated numbers are valid before adding
        rowData[headerToIndexMap["Bhagyank"]] =
          typeof calculatedData.bhagyank === "number" && !isNaN(calculatedData.bhagyank)
            ? calculatedData.bhagyank
            : "";
        rowData[headerToIndexMap["Moolank"]] =
          typeof calculatedData.moolank === "number" && !isNaN(calculatedData.moolank)
            ? calculatedData.moolank
            : "";
        rowData[headerToIndexMap["Kua"]] =
          typeof calculatedData.kua === "number" && !isNaN(calculatedData.kua)
            ? calculatedData.kua
            : "";

        // Populate Name Numerology data if available
        if (calculatedData.nameNumerology) {
          rowData[headerToIndexMap["Destiny No."]] =
            calculatedData.nameNumerology.destinyNumber ?? "";
          rowData[headerToIndexMap["Soul Urge No."]] =
            calculatedData.nameNumerology.soulUrgeNumber ?? "";
          rowData[headerToIndexMap["Personality No."]] =
            calculatedData.nameNumerology.personalityNumber ?? "";
        } else {
          rowData[headerToIndexMap["Destiny No."]] = "";
          rowData[headerToIndexMap["Soul Urge No."]] = "";
          rowData[headerToIndexMap["Personality No."]] = "";
        }
        // Removed report from export

        // Populate grid data
        const gridCellContents = {}; // Temporary store: { "Grid 4": [4, 4], "Grid 9": [9], ... }

        if (calculatedData.gridNumbers && Array.isArray(calculatedData.gridNumbers)) {
          calculatedData.gridNumbers.forEach((num) => {
            const number = parseInt(num, 10); // Ensure it's a number
            if (!isNaN(number) && number !== 0 && positionToHeaderMap[number]) {
              const headerName = positionToHeaderMap[number];
              if (!gridCellContents[headerName]) {
                gridCellContents[headerName] = [];
              }
              gridCellContents[headerName].push(number);
            }
          });
        }

        // Add grid cell contents (joined numbers) to the rowData array
        for (const headerName in gridCellContents) {
          if (headerToIndexMap.hasOwnProperty(headerName)) {
            const index = headerToIndexMap[headerName];
            // Join numbers with a space, ensure result is always a string
            rowData[index] = gridCellContents[headerName]
              ? gridCellContents[headerName].join(" ")
              : "";
          }
        }
      } else {
        // Handle cases where API call failed for a user
        rowData[headerToIndexMap["Name"]] = user.name || "";
        rowData[headerToIndexMap["Date of Birth"]] = user.dob || "";
        rowData[headerToIndexMap["Gender"]] = user.gender || "";
        // Fill remaining calculated fields with 'Error' or similar
        for (let i = 3; i < headers.length; i++) {
          rowData[i] = "Error";
        }
      }

      // Return the fully populated and sanitized row
      return rowData;
    });

    // Prepend headers to the data
    const worksheetData = [headers, ...dataToExport];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "NumerologyData"); // Sheet name

    // Trigger download
    XLSX.writeFile(wb, "NumerologyInsights_Export.xlsx"); // File name
  };

  return (
    <>
      <h2>Numerology Grid Calculator</h2>

      {/* Input Area */}
      <div id="inputArea">
        <h3>Add User Details</h3>
        {/* Name input was already present, ensure it's correctly bound */}
        <label>
          Full Name:
          <input
            type="text"
            id="name"
            placeholder="Enter Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required // Make visually required, validation is in addUser
          />
        </label>
        <label>
          Date of Birth:
          <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} />
        </label>
        <label>
          Gender:
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <button onClick={addUser}>Add User</button>
      </div>

      {/* User List */}
      <div id="userList">
        <h3>User List</h3>
        {/* Replace table with a div container for cards */}
        <div className="user-card-list">
          {usersData.length === 0 ? (
            <p style={{ textAlign: "center", width: "100%", color: "var(--text-muted-color)" }}>
              No users added yet.
            </p>
          ) : (
            usersData.map((user) => (
              // Render UserCard instead of UserTableRow
              <UserCard key={user.id} user={user} getOrFetchUserData={getOrFetchUserData} />
            ))
          )}
        </div>
      </div>

      {/* Export Section */}
      <div id="exportSection">
        <h3>Export Data</h3>
        <button onClick={exportToExcel}>Export to Excel</button>
      </div>
    </>
  );
}

// --- REVISED: Renamed UserTableRow to UserCard and updated structure ---
function UserCard({ user, getOrFetchUserData }) {
  // Renamed component
  const [userData, setUserData] = useState(null); // State for calculated data
  const [isLoading, setIsLoading] = useState(true); // Start in loading state

  useEffect(() => {
    let isMounted = true; // Flag to prevent state update on unmounted component
    setIsLoading(true);
    getOrFetchUserData(user).then((data) => {
      if (isMounted) {
        console.log(`User ${user.id} (${user.name}) Data Received:`, data); // <-- Add console log here
        setUserData(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    }; // Cleanup function
  }, [user, getOrFetchUserData]); // Re-fetch if user or fetch function changes

  const bhagyank = isLoading ? "..." : userData ? userData.bhagyank : "-";
  const moolank = isLoading ? "..." : userData ? userData.moolank : "-";
  const kua = isLoading ? "..." : userData ? userData.kua : "-";
  const gridNumbersArray = isLoading ? null : userData ? userData.gridNumbers : null;
  // Extract Name Numerology numbers
  const destiny = isLoading
    ? "..."
    : userData?.nameNumerology
      ? userData.nameNumerology.destinyNumber
      : "-";
  const soulUrge = isLoading
    ? "..."
    : userData?.nameNumerology
      ? userData.nameNumerology.soulUrgeNumber
      : "-";
  const personality = isLoading
    ? "..."
    : userData?.nameNumerology
      ? userData.nameNumerology.personalityNumber
      : "-";
  // Removed report state

  // Handler for downloading the PDF
  const handleDownloadPdf = async () => {
    // Construct the URL for the PDF endpoint using the base URL, adding the name
    const pdfUrl = `${API_BASE_URL}/report/pdf?dob=${encodeURIComponent(user.dob)}&gender=${encodeURIComponent(
      user.gender
    )}&name=${encodeURIComponent(user.name)}`; // Add name parameter

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`PDF download failed: ${response.statusText}`);
      }
      const blob = await response.blob();

      // Create a link element to trigger the download
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `Numerology_Report_${user.dob.replace(/-/g, "")}_${user.name.replace(/\s+/g, "_")}.pdf`; // Suggest a filename
      document.body.appendChild(link); // Required for Firefox
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download the report PDF. Please try again.");
    }
  };

  // Helper to format number display in the table cell (moved inside UserCard)
  const formatCellDisplay = (numberResult) => {
    if (isLoading) return "...";
    if (!numberResult) return "-";

    // Handle both direct numbers (like Moolank, Kua) and result objects
    const value = numberResult.value ?? numberResult; // Get final value
    const karmic = numberResult.karmic ?? null;

    if (isNaN(value)) return "-"; // Handle potential NaN

    let display = value.toString();
    if (karmic) {
      // Add a small indicator for Karmic Debt, tooltip could be added with CSS/JS
      display += ` (KD ${karmic})`;
    }
    return display;
  };

  // Extract display values using the helper
  const bhagyankDisplay = formatCellDisplay(userData?.bhagyank);
  const moolankDisplay = formatCellDisplay(userData?.moolank); // Moolank is simple value
  const kuaDisplay = formatCellDisplay(userData?.kua); // Kua is simple value
  const destinyDisplay = formatCellDisplay(userData?.nameNumerology?.destinyNumber);
  const soulUrgeDisplay = formatCellDisplay(userData?.nameNumerology?.soulUrgeNumber);
  const personalityDisplay = formatCellDisplay(userData?.nameNumerology?.personalityNumber);

  // Render as a card div instead of table row
  return (
    <div className="user-card">
      <div className="user-card-header">
        <h3>{user.name}</h3>
        <span>
          {user.dob} ({user.gender})
        </span>
      </div>
      <div className="user-card-body">
        <div className="user-card-details">
          <p>
            <strong
              title={userData?.bhagyank?.karmic ? `Karmic Debt: ${userData.bhagyank.karmic}` : ""}
            >
              Bhagyank:
            </strong>{" "}
            {bhagyankDisplay}
          </p>
          {/* Moolank Details - Expanded */}
          <div className="moolank-details-section">
            <p>
              <strong>Moolank:</strong> {moolankDisplay}
            </p>
            {!isLoading && userData?.moolankMeaning && (
              <>
                <p className="moolank-meta">
                  <FaStar className="moolank-icon" /> Grah: {userData.moolankMeaning.grah || "N/A"}{" "}
                  | Rashi: {userData.moolankMeaning.rashi || "N/A"}
                </p>
                <p className="moolank-keywords">
                  <em>Keywords: {userData.moolankMeaning.keywords?.join(", ") || "N/A"}</em>
                </p>
                {/* Optionally add collapsible sections for more details */}
              </>
            )}
          </div>
          <p>
            <strong>Kua:</strong> {kuaDisplay}
          </p>
          <hr /> {/* Separator */}
          <p>
            <strong
              title={
                userData?.nameNumerology?.destinyNumber?.karmic
                  ? `Karmic Debt: ${userData.nameNumerology.destinyNumber.karmic}`
                  : ""
              }
            >
              Destiny:
            </strong>{" "}
            {destinyDisplay}
          </p>
          <p>
            <strong
              title={
                userData?.nameNumerology?.soulUrgeNumber?.karmic
                  ? `Karmic Debt: ${userData.nameNumerology.soulUrgeNumber.karmic}`
                  : ""
              }
            >
              Soul Urge:
            </strong>{" "}
            {soulUrgeDisplay}
          </p>
          <p>
            <strong
              title={
                userData?.nameNumerology?.personalityNumber?.karmic
                  ? `Karmic Debt: ${userData.nameNumerology.personalityNumber.karmic}`
                  : ""
              }
            >
              Personality:
            </strong>{" "}
            {personalityDisplay}
          </p>
        </div>
        <div className="user-card-grid">
          {isLoading ? (
            <p>Loading Grid...</p>
          ) : gridNumbersArray ? (
            // Pass gridAnalysis data to the NumerologyGrid component
            <NumerologyGrid gridNumbers={gridNumbersArray} gridAnalysis={userData?.gridAnalysis} />
          ) : (
            <p>-</p> // Show dash if no grid or error
          )}
        </div>
      </div>
      {/* NEW: Display Grid Analysis */}
      {!isLoading && userData?.gridAnalysis && userData.gridAnalysis.length > 0 && (
        <div className="user-card-analysis">
          <h4>Grid Analysis:</h4>
          <ul>
            {userData.gridAnalysis.map((item, index) => (
              <li key={index}>
                <strong>{item.name}:</strong> {item.interpretation}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* NEW: Detailed Moolank Analysis Section */}
      {!isLoading && userData?.moolankMeaning && (
        <div className="moolank-full-analysis">
          <h4>Moolank {moolankDisplay} Analysis:</h4>
          {userData.moolankMeaning.characteristics && (
            <div className="moolank-sub-section">
              <h5>
                <FaThumbsUp className="moolank-icon positive" /> Characteristics:
              </h5>
              <ul>
                {userData.moolankMeaning.characteristics.map((c, i) => (
                  <li key={`char-${i}`}>{c}</li>
                ))}
              </ul>
              {/* Add a "show more" button if needed */}
            </div>
          )}
          {userData.moolankMeaning.negativeTraits && (
            <div className="moolank-sub-section">
              <h5>
                <FaThumbsDown className="moolank-icon negative" /> Negative Traits:
              </h5>
              <ul>
                {userData.moolankMeaning.negativeTraits.slice(0, 3).map((n, i) => (
                  <li key={`neg-${i}`}>{n}</li>
                ))}
              </ul>
            </div>
          )}
          {userData.moolankMeaning.suggestions && (
            <div className="moolank-sub-section">
              <h5>
                <FaLightbulb className="moolank-icon suggestion" /> Suggestions:
              </h5>
              <ul>
                {userData.moolankMeaning.suggestions.slice(0, 3).map((s, i) => (
                  <li key={`sug-${i}`}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <div className="user-card-actions">
        <button
          onClick={handleDownloadPdf}
          disabled={isLoading || !userData || userData.moolank === "Error"}
        >
          {isLoading ? "Loading..." : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

export default GridCalculator;
