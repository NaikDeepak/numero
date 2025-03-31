import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { calculateNumerologyData } from '../numerologyUtils'; // Adjust path
import NumerologyGrid from '../NumerologyGrid'; // Adjust path

function GridCalculator() {
  // State for input fields
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male'); // Default gender

  // State for the list of users
  const [usersData, setUsersData] = useState([]);

  // Function to add a new user
  const addUser = () => {
    // Basic validation
    if (!name.trim() || !dob) {
      alert("Please enter both Name and Date of Birth.");
      return;
    }

    const newUser = {
      id: Date.now(), // Simple unique ID using timestamp
      name: name.trim(),
      dob: dob,
      gender: gender,
    };

    setUsersData([...usersData, newUser]); // Add new user to the list

    // Clear input fields
    setName('');
    setDob('');
    setGender('Male'); // Reset gender to default
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    if (usersData.length === 0) {
      alert("Please add at least one user before exporting.");
      return;
    }

    // Define detailed headers for the Excel sheet, including individual grid cells
    const headers = [
      "Name", "Date of Birth", "Gender",
      "Bhagyank", "Moolank", "Kua",
      "Grid 4", "Grid 9", "Grid 2", // Top row
      "Grid 3", "Grid 5", "Grid 7", // Middle row
      "Grid 8", "Grid 1", "Grid 6"  // Bottom row
    ];

    // Map Lo Shu grid numbers to their corresponding header names
    const positionToHeaderMap = {
        4: "Grid 4", 9: "Grid 9", 2: "Grid 2",
        3: "Grid 3", 5: "Grid 5", 7: "Grid 7",
        8: "Grid 8", 1: "Grid 1", 6: "Grid 6"
    };
    // Create a reverse map for easy index lookup
    const headerToIndexMap = {};
    headers.forEach((h, i) => { headerToIndexMap[h] = i; });


    // Calculate data for all users before exporting
    const dataToExport = usersData.map(user => {
      const calculatedData = calculateNumerologyData(user.dob, user.gender);

      // Initialize row data with empty strings matching headers length
      const rowData = new Array(headers.length).fill('');

      if (calculatedData) {
        // Populate basic info and calculated numbers
        rowData[headerToIndexMap["Name"]] = user.name || '';
        rowData[headerToIndexMap["Date of Birth"]] = user.dob || '';
        rowData[headerToIndexMap["Gender"]] = user.gender || '';
        // Ensure calculated numbers are valid before adding
        rowData[headerToIndexMap["Bhagyank"]] = (typeof calculatedData.bhagyank === 'number' && !isNaN(calculatedData.bhagyank)) ? calculatedData.bhagyank : '';
        rowData[headerToIndexMap["Moolank"]] = (typeof calculatedData.moolank === 'number' && !isNaN(calculatedData.moolank)) ? calculatedData.moolank : '';
        rowData[headerToIndexMap["Kua"]] = (typeof calculatedData.kua === 'number' && !isNaN(calculatedData.kua)) ? calculatedData.kua : '';

        // Populate grid data
        const gridCellContents = {}; // Temporary store: { "Grid 4": [4, 4], "Grid 9": [9], ... }

        if (calculatedData.gridNumbers && Array.isArray(calculatedData.gridNumbers)) {
          calculatedData.gridNumbers.forEach(num => {
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
               rowData[index] = gridCellContents[headerName] ? gridCellContents[headerName].join(' ') : '';
           }
       }
      } else {
        // Handle cases where calculation failed for a user (optional: fill basic info)
        rowData[headerToIndexMap["Name"]] = user.name || '';
        rowData[headerToIndexMap["Date of Birth"]] = user.dob || '';
        rowData[headerToIndexMap["Gender"]] = user.gender || '';
        // Fill remaining calculated fields with 'Error' or similar
        for (let i = 3; i < headers.length; i++) {
            rowData[i] = 'Error';
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
        <label>Full Name:
          <input
            type="text"
            id="name"
            placeholder="Enter Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>Date of Birth:
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </label>
        <label>Gender:
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <button onClick={addUser}>Add User</button>
      </div>

      {/* User List */}
      <div id="userList">
        <h3>User List</h3>
        <table id="userDataTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Bhagyank</th>
              <th>Moolank</th>
              <th>Kua</th>
              <th>Numerology Grid</th>
            </tr>
          </thead>
          <tbody>
            {usersData.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No users added yet.</td>
              </tr>
            ) : (
              usersData.map((user) => {
                const calculatedData = calculateNumerologyData(user.dob, user.gender);
                const bhagyank = calculatedData ? calculatedData.bhagyank : '-';
                const moolank = calculatedData ? calculatedData.moolank : '-';
                const kua = calculatedData ? calculatedData.kua : '-';
                const gridNumbersArray = calculatedData ? calculatedData.gridNumbers : null;

                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.dob}</td>
                    <td>{user.gender}</td>
                    <td>{bhagyank}</td>
                    <td>{moolank}</td>
                    <td>{kua}</td>
                    <td>
                      {gridNumbersArray ? (
                        <NumerologyGrid gridNumbers={gridNumbersArray} />
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Export Section */}
      <div id="exportSection">
        <h3>Export Data</h3>
        <button onClick={exportToExcel}>Calculate All & Export to Excel</button>
      </div>
    </>
  );
}

export default GridCalculator;
