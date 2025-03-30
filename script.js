// script.js - Numerology Calculator Logic

// --- Global State ---
let usersData = []; // Array to store data for multiple users

// --- Helper Functions (Pure Calculations) ---

/**
 * Calculates the sum of digits in a string.
 * @param {string} numStr - The string containing digits.
 * @returns {number} The sum of the digits.
 */
function sumDigits(numStr) {
    return numStr.toString().split('').reduce((sum, digit) => {
        const parsedDigit = parseInt(digit, 10);
        return sum + (isNaN(parsedDigit) ? 0 : parsedDigit); // Handle potential non-digits safely
    }, 0);
}

/**
 * Reduces a number to a single digit by repeatedly summing its digits.
 * @param {number|string} num - The number or string representation of the number to reduce.
 * @returns {number} The single-digit result. Returns 0 for invalid input.
 */
function reduceToSingleDigit(num) {
    // Ensure input is treated as a number for the loop condition
    let currentNum = typeof num === 'string' ? parseInt(num, 10) : num;
     if (isNaN(currentNum)) return 0; // Handle invalid input

    while (currentNum > 9) {
        // sumDigits expects a string
        currentNum = sumDigits(currentNum.toString());
    }
    return currentNum;
}

// --- Core Calculation Logic (Pure Calculation) ---

/**
 * Calculates Bhagyank, Moolank, Kua, and collects grid numbers for a given DOB and gender.
 * @param {string} dob - Date of Birth in "YYYY-MM-DD" format.
 * @param {string} gender - "Male" or "Female".
 * @returns {object|null} An object { bhagyank, moolank, kua, gridNumbers } or null if input is invalid.
 */
function calculateNumerologyData(dob, gender) {
    // Input validation within the function
    if (!dob || typeof dob !== 'string' || !gender) {
         console.error("Invalid input to calculateNumerologyData:", dob, gender);
         return null; // Return null for invalid input
    }

    let dateParts = dob.split("-");
    if (dateParts.length !== 3) {
        console.error("Invalid date format:", dob);
        return null;
    }

    let year = parseInt(dateParts[0], 10);
    let month = parseInt(dateParts[1], 10);
    let day = parseInt(dateParts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error("Invalid date components:", year, month, day);
        return null;
    }

    // Format parts for digit extraction
    let yearStr = year.toString();
    let monthStr = month.toString().padStart(2, '0');
    let dayStr = day.toString().padStart(2, '0');
    let fullDateStr = yearStr + monthStr + dayStr;

    // Calculate Bhagyank (sum of all digits in YYYYMMDD)
    let bhagyank = reduceToSingleDigit(sumDigits(fullDateStr));

    // Calculate Moolank (sum of digits in DD)
    let moolank = reduceToSingleDigit(sumDigits(dayStr)); // Use dayStr in case day is single digit

    // Calculate Kua
    let yearSumReduced = reduceToSingleDigit(sumDigits(yearStr));
    let kuaRaw = gender === "Male" ? (11 - yearSumReduced) : (4 + yearSumReduced);
    let kuaReduced = reduceToSingleDigit(kuaRaw);
    let kua = kuaReduced; // Final Kua number

    // --- Grid Number Collection ---
    let gridNumbers = [];
    // Add individual digits from DOB (YYYYMMDD), excluding 0
    fullDateStr.split('').forEach(digitChar => {
        let digit = parseInt(digitChar, 10);
        if (digit !== 0) {
            gridNumbers.push(digit);
        }
    });

    // Add calculated numbers
    gridNumbers.push(bhagyank);
    // Add Moolank only if the original day (DD) is not 1-9, 10, 20, or 30
    if (!(day >= 1 && day <= 9 || day === 10 || day === 20 || day === 30)) {
        gridNumbers.push(moolank);
    }
    gridNumbers.push(kua);

    // Return all calculated data
    return { bhagyank, moolank, kua, gridNumbers };
}


// --- UI Generation Functions (DOM Interaction) ---

/**
 * Generates the HTML string for a Lo Shu grid based on the provided numbers.
 * @param {number[]} gridNumbers - Array of numbers to place in the grid.
 * @returns {string} HTML string representing the grid.
 */
function generateGridHtml(gridNumbers) {
    // Lo Shu Grid position mapping (Number -> Cell Index 0-8)
    // 4 9 2  -> 0 1 2
    // 3 5 7  -> 3 4 5
    // 8 1 6  -> 6 7 8
    const positionMap = { 4: 0, 9: 1, 2: 2, 3: 3, 5: 4, 7: 5, 8: 6, 1: 7, 6: 8 };
    let cells = Array(9).fill(''); // Initialize 9 empty cells

    // Populate cell contents based on gridNumbers
    gridNumbers.forEach(num => {
        if (num !== 0 && positionMap.hasOwnProperty(num)) {
            let cellIndex = positionMap[num];
            cells[cellIndex] += (cells[cellIndex] ? ' ' : '') + num; // Append number with space
        }
    });

    // Generate HTML string for the grid
    let gridHtml = '<div class="grid">'; // Use the existing .grid style
    for(let i = 0; i < 9; i++) {
        gridHtml += `<div class="cell">${cells[i]}</div>`; // Use the existing .cell style
    }
    gridHtml += '</div>';
    return gridHtml;
}

/**
 * Updates the user data table in the HTML. Reads from global usersData.
 */
function updateUserTable() {
    const tableBody = document.getElementById("userDataTable").querySelector("tbody");
    if (!tableBody) {
        console.error("Could not find table body for userDataTable");
        return;
    }
    tableBody.innerHTML = ''; // Clear existing rows

    usersData.forEach(user => {
        const calculatedData = calculateNumerologyData(user.dob, user.gender);
        const row = tableBody.insertRow();

        row.insertCell(0).textContent = user.name;
        row.insertCell(1).textContent = user.dob;
        row.insertCell(2).textContent = user.gender;

        if (calculatedData) {
            // Sanitize numbers before display (similar to export)
            const displayBhagyank = typeof calculatedData.bhagyank === 'number' && !isNaN(calculatedData.bhagyank) ? calculatedData.bhagyank : '-';
            const displayMoolank = typeof calculatedData.moolank === 'number' && !isNaN(calculatedData.moolank) ? calculatedData.moolank : '-';
            const displayKua = typeof calculatedData.kua === 'number' && !isNaN(calculatedData.kua) ? calculatedData.kua : '-';

            row.insertCell(3).textContent = displayBhagyank;
            row.insertCell(4).textContent = displayMoolank;
            row.insertCell(5).textContent = displayKua;
            // Generate and insert the grid HTML
            row.insertCell(6).innerHTML = generateGridHtml(calculatedData.gridNumbers);
        } else {
            // Add placeholder cells if calculation failed
            row.insertCell(3).textContent = 'Error';
            row.insertCell(4).textContent = 'Error';
            row.insertCell(5).textContent = 'Error';
            row.insertCell(6).textContent = 'Error calculating grid';
        }
    });
}

// --- Event Handlers / UI Interaction Functions (DOM Interaction) ---

/**
 * Handles adding a new user from the form inputs.
 */
function addUser() {
    const nameInput = document.getElementById("name");
    const dobInput = document.getElementById("dob");
    const genderInput = document.getElementById("gender");

    // Basic validation for presence of elements
    if (!nameInput || !dobInput || !genderInput) {
        console.error("One or more input elements not found.");
        alert("Error: Input fields are missing.");
        return;
    }

    const name = nameInput.value.trim();
    const dob = dobInput.value;
    const gender = genderInput.value;

    if (!name || !dob) {
        alert("Please enter both Name and Date of Birth.");
        return;
    }

    // Add user to the global array
    usersData.push({ name, dob, gender });

    // Update the display table
    updateUserTable();

    // Clear input fields
    nameInput.value = '';
    dobInput.value = '';
    // Optionally reset gender or leave as is
}


// --- Export Function (DOM Interaction, External Library Interaction) ---

/**
 * Handles calculating data for all users and exporting to Excel.
 */
function exportToExcel() {
    // Check if SheetJS library is loaded
    if (typeof XLSX === 'undefined') {
        alert("Error: Excel library (SheetJS) failed to load. Please check your internet connection and ensure nothing is blocking the script.");
        console.error("XLSX object not found. SheetJS might not be loaded.");
        return;
    }

    if (usersData.length === 0) {
        alert("Please add at least one user before exporting.");
        return;
    }

    const dataForExcel = [];
    // Define headers for Excel
    const headers = [
        "Name", "Date of Birth", "Gender",
        "Bhagyank", "Moolank", "Kua",
        "Grid 4", "Grid 9", "Grid 2", // Corresponds to cells c1, c2, c3
        "Grid 3", "Grid 5", "Grid 7", // Corresponds to cells c4, c5, c6
        "Grid 8", "Grid 1", "Grid 6"  // Corresponds to cells c7, c8, c9
    ];
    dataForExcel.push(headers);

     // Lo Shu Grid position mapping (Number -> Grid Header Name)
    const positionToHeaderMap = {
        4: "Grid 4", 9: "Grid 9", 2: "Grid 2",
        3: "Grid 3", 5: "Grid 5", 7: "Grid 7",
        8: "Grid 8", 1: "Grid 1", 6: "Grid 6"
    };
    // Create reverse map: Header Name -> Index in headers array
    const headerToIndexMap = {};
    headers.forEach((h, i) => { headerToIndexMap[h] = i; });


    // Process each user
    usersData.forEach(user => {
        console.log(`[Export] Processing user: ${user.name}`); // Log user being processed
        const calculatedData = calculateNumerologyData(user.dob, user.gender);

        if (!calculatedData) {
            console.warn(`[Export] Skipping user ${user.name} due to calculation error.`);
            return; // Skip this user if calculation failed
        }
        console.log(`[Export] Calculated data for ${user.name}:`, calculatedData); // Log calculated data

        // Initialize row data with placeholders matching headers
        const rowData = new Array(headers.length).fill(''); // Fill with empty strings initially

        // Populate basic info and calculated numbers
        rowData[headerToIndexMap["Name"]] = user.name;
        rowData[headerToIndexMap["Date of Birth"]] = user.dob;
        rowData[headerToIndexMap["Gender"]] = user.gender;
        rowData[headerToIndexMap["Bhagyank"]] = calculatedData.bhagyank;
        rowData[headerToIndexMap["Moolank"]] = calculatedData.moolank;
        rowData[headerToIndexMap["Kua"]] = calculatedData.kua;

        // Populate grid data
        const gridCellContents = {}; // Store numbers for each grid cell header

        calculatedData.gridNumbers.forEach(num => {
            if (num !== 0 && positionToHeaderMap[num]) {
                const headerName = positionToHeaderMap[num];
                if (!gridCellContents[headerName]) {
                    gridCellContents[headerName] = [];
                }
                gridCellContents[headerName].push(num);
            }
        });

        // Add grid cell contents to the rowData array
        for (const headerName in gridCellContents) {
           if (headerToIndexMap.hasOwnProperty(headerName)) {
               const index = headerToIndexMap[headerName];
               // Ensure the joined result is always a string, even if empty
               const cellString = gridCellContents[headerName] ? gridCellContents[headerName].join(' ') : '';
               rowData[index] = cellString;
           }
       }

       // Final sanitization of the entire rowData array before adding
       const sanitizedRowData = rowData.map(cellValue => {
           // Replace null or undefined with empty string, otherwise keep the value
           return (cellValue === null || cellValue === undefined) ? '' : cellValue;
       });

       dataForExcel.push(sanitizedRowData);
       console.log(`[Export] Sanitized row data added for ${user.name}:`, sanitizedRowData); // Log the final sanitized row data
   });

   // Create worksheet and workbook using SheetJS, wrapped in try/catch
   try {
       console.log("[Export] Preparing worksheet data:", dataForExcel); // Log final data array
       const ws = XLSX.utils.aoa_to_sheet(dataForExcel);
       const wb = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, "Numerology Data");

       // Trigger download
       console.log("[Export] Triggering file download...");
       XLSX.writeFile(wb, "NumerologyExport.xlsx");
       console.log("[Export] Download triggered successfully.");
   } catch (error) {
       console.error("[Export] Error during Excel generation/download:", error);
       alert("An error occurred while generating the Excel file. Please check the console (F12) for details.");
   }
}
