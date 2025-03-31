import React, { useState, useEffect } from "react" // Added useEffect
import * as XLSX from "xlsx"
// Removed import { calculateNumerologyData } from '../numerologyUtils';
import NumerologyGrid from "../NumerologyGrid" // Adjust path

// Read BASE API URL from environment variable, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

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
    })
    if (!response.ok) {
      const errorData = await response.json()
      console.error(`API Error (${response.status}):`, errorData.error || "Unknown error")
      return null // Indicate failure
    }
    return await response.json() // Return calculated data
  } catch (error) {
    console.error("Network or fetch error:", error)
    alert("Failed to connect to the calculation API. Please ensure the backend server is running.")
    return null // Indicate failure
  }
}

function GridCalculator() {
  // State for input fields (name was already here, good!)
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("Male") // Default gender

  // State for the list of users (stores only basic info now)
  const [usersData, setUsersData] = useState([])
  // State to hold calculated data for display in the table
  const [calculatedUsersData, setCalculatedUsersData] = useState({}) // { userId: { moolank: ..., bhagyank: ..., report: ... }, ... }

  // Function to add a new user (includes name validation)
  const addUser = () => {
    // Basic validation - ensure name is also entered
    const trimmedName = name.trim();
    if (!trimmedName || !dob) {
      alert("Please enter Full Name and Date of Birth.")
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
    }

    setUsersData((prevUsers) => [...prevUsers, newUser]) // Add new user to the list

    // Clear input fields
    setName("") // Clear name field
    setDob("")
    setGender("Male") // Reset gender to default
    // No immediate calculation needed here
  }

  // Function to fetch and update calculated data for a specific user
  // Using useCallback to memoize the function for stability in UserTableRow useEffect dependency
  const getOrFetchUserData = React.useCallback(
    async (user) => {
      if (calculatedUsersData[user.id]) {
        return calculatedUsersData[user.id] // Return cached data
      }

      // Pass user.name to the fetch function
      const data = await fetchNumerologyData(user.dob, user.gender, user.name)
      if (data) {
        setCalculatedUsersData((prevData) => ({
          ...prevData,
          [user.id]: data, // Cache the fetched data
        }))
        return data
      }
      // Return an object indicating error for consistent handling in UserTableRow
      // Include nameNumerology: null in the error structure
      return { moolank: "Error", bhagyank: "Error", kua: "Error", gridNumbers: null, nameNumerology: null }
    },
    [calculatedUsersData] // Dependency remains the same
  ) // Dependency: re-create if cache changes (though unlikely needed here)

  // Function to export data to Excel (fetches all data first)
  const exportToExcel = async () => {
    // Made async
    if (usersData.length === 0) {
      alert("Please add at least one user before exporting.")
      return
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
      "Destiny No.",      // New header
      "Soul Urge No.",    // New header
      "Personality No.", // New header
      // Removed "Report" header
    ]

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
    }
    // Create a reverse map for easy index lookup
    const headerToIndexMap = {}
    headers.forEach((h, i) => {
      headerToIndexMap[h] = i
    })

    // Fetch calculated data for all users concurrently
    alert("Calculating data for export... Please wait.") // Inform user
    const calculatedDataPromises = usersData.map((user) =>
      // Pass user.name to fetchNumerologyData for export
      fetchNumerologyData(user.dob, user.gender, user.name).then((data) => ({ user, data }))
    )

    const results = await Promise.all(calculatedDataPromises)
    alert("Calculation complete. Preparing Excel file.") // Inform user

    // Process results to create export data
    const dataToExport = results.map(({ user, data: calculatedData }) => {
      // Initialize row data with empty strings matching headers length
      const rowData = new Array(headers.length).fill("")

      if (calculatedData) {
        // Populate basic info and calculated numbers
        rowData[headerToIndexMap["Name"]] = user.name || ""
        rowData[headerToIndexMap["Date of Birth"]] = user.dob || ""
        rowData[headerToIndexMap["Gender"]] = user.gender || ""
        // Ensure calculated numbers are valid before adding
        rowData[headerToIndexMap["Bhagyank"]] =
          typeof calculatedData.bhagyank === "number" && !isNaN(calculatedData.bhagyank) ? calculatedData.bhagyank : ""
        rowData[headerToIndexMap["Moolank"]] =
          typeof calculatedData.moolank === "number" && !isNaN(calculatedData.moolank) ? calculatedData.moolank : ""
        rowData[headerToIndexMap["Kua"]] =
          typeof calculatedData.kua === "number" && !isNaN(calculatedData.kua) ? calculatedData.kua : ""

        // Populate Name Numerology data if available
        if (calculatedData.nameNumerology) {
            rowData[headerToIndexMap["Destiny No."]] = calculatedData.nameNumerology.destinyNumber ?? "";
            rowData[headerToIndexMap["Soul Urge No."]] = calculatedData.nameNumerology.soulUrgeNumber ?? "";
            rowData[headerToIndexMap["Personality No."]] = calculatedData.nameNumerology.personalityNumber ?? "";
        } else {
             rowData[headerToIndexMap["Destiny No."]] = "";
             rowData[headerToIndexMap["Soul Urge No."]] = "";
             rowData[headerToIndexMap["Personality No."]] = "";
        }
        // Removed report from export

        // Populate grid data
        const gridCellContents = {} // Temporary store: { "Grid 4": [4, 4], "Grid 9": [9], ... }

        if (calculatedData.gridNumbers && Array.isArray(calculatedData.gridNumbers)) {
          calculatedData.gridNumbers.forEach((num) => {
            const number = parseInt(num, 10) // Ensure it's a number
            if (!isNaN(number) && number !== 0 && positionToHeaderMap[number]) {
              const headerName = positionToHeaderMap[number]
              if (!gridCellContents[headerName]) {
                gridCellContents[headerName] = []
              }
              gridCellContents[headerName].push(number)
            }
          })
        }

        // Add grid cell contents (joined numbers) to the rowData array
        for (const headerName in gridCellContents) {
          if (headerToIndexMap.hasOwnProperty(headerName)) {
            const index = headerToIndexMap[headerName]
            // Join numbers with a space, ensure result is always a string
            rowData[index] = gridCellContents[headerName] ? gridCellContents[headerName].join(" ") : ""
          }
        }
      } else {
        // Handle cases where API call failed for a user
        rowData[headerToIndexMap["Name"]] = user.name || ""
        rowData[headerToIndexMap["Date of Birth"]] = user.dob || ""
        rowData[headerToIndexMap["Gender"]] = user.gender || ""
        // Fill remaining calculated fields with 'Error' or similar
        for (let i = 3; i < headers.length; i++) {
          rowData[i] = "Error"
        }
      }

      // Return the fully populated and sanitized row
      return rowData
    })

    // Prepend headers to the data
    const worksheetData = [headers, ...dataToExport]

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "NumerologyData") // Sheet name

    // Trigger download
    XLSX.writeFile(wb, "NumerologyInsights_Export.xlsx") // File name
  }

  return (
    <>
      <h2>Numerology Grid Calculator</h2>

      {/* Input Area */}
      <div id='inputArea'>
        <h3>Add User Details</h3>
        {/* Name input was already present, ensure it's correctly bound */}
        <label>
          Full Name:
          <input
            type='text'
            id='name'
            placeholder='Enter Full Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required // Make visually required, validation is in addUser
          />
        </label>
        <label>
          Date of Birth:
          <input type='date' id='dob' value={dob} onChange={(e) => setDob(e.target.value)} />
        </label>
        <label>
          Gender:
          <select id='gender' value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
          </select>
        </label>
        <button onClick={addUser}>Add User</button>
      </div>

      {/* User List */}
      <div id='userList'>
        <h3>User List</h3>
        <table id='userDataTable'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Bhagyank</th>
              <th>Moolank</th>
              <th>Kua</th>
              {/* Add Name Numerology Headers */}
              <th>Destiny</th>
              <th>Soul Urge</th>
              <th>Personality</th>
              <th>Numerology Grid</th>
              <th>Actions</th> {/* Changed header to Actions */}
            </tr>
          </thead>
          <tbody>
            {usersData.length === 0 ? (
              <tr>
                {/* Update colspan to 11 */}
                <td colSpan='11' style={{ textAlign: "center" }}>
                  No users added yet.
                </td>{" "}
              </tr>
            ) : (
              usersData.map((user) => (
                // Use a separate component for the row to manage its state
                <UserTableRow key={user.id} user={user} getOrFetchUserData={getOrFetchUserData} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Export Section */}
      <div id='exportSection'>
        <h3>Export Data</h3>
        <button onClick={exportToExcel}>Export to Excel</button>
      </div>
    </>
  )
}

// New component for table row to handle individual data fetching
function UserTableRow({ user, getOrFetchUserData }) {
  const [userData, setUserData] = useState(null) // State for calculated data
  const [isLoading, setIsLoading] = useState(true) // Start in loading state

  useEffect(() => {
    let isMounted = true // Flag to prevent state update on unmounted component
    setIsLoading(true)
    getOrFetchUserData(user).then((data) => {
      if (isMounted) {
        setUserData(data)
        setIsLoading(false)
      }
    })
    return () => {
      isMounted = false
    } // Cleanup function
  }, [user, getOrFetchUserData]) // Re-fetch if user or fetch function changes

  const bhagyank = isLoading ? "..." : userData ? userData.bhagyank : "-"
  const moolank = isLoading ? "..." : userData ? userData.moolank : "-"
  const kua = isLoading ? "..." : userData ? userData.kua : "-"
  const gridNumbersArray = isLoading ? null : userData ? userData.gridNumbers : null
  // Extract Name Numerology numbers
  const destiny = isLoading ? "..." : userData?.nameNumerology ? userData.nameNumerology.destinyNumber : "-"
  const soulUrge = isLoading ? "..." : userData?.nameNumerology ? userData.nameNumerology.soulUrgeNumber : "-"
  const personality = isLoading ? "..." : userData?.nameNumerology ? userData.nameNumerology.personalityNumber : "-"
  // Removed report state

  // Handler for downloading the PDF
  const handleDownloadPdf = async () => {
    // Construct the URL for the PDF endpoint using the base URL, adding the name
    const pdfUrl = `${API_BASE_URL}/report/pdf?dob=${encodeURIComponent(user.dob)}&gender=${encodeURIComponent(
      user.gender
    )}&name=${encodeURIComponent(user.name)}` // Add name parameter

    try {
      const response = await fetch(pdfUrl)
      if (!response.ok) {
        throw new Error(`PDF download failed: ${response.statusText}`)
      }
      const blob = await response.blob()

      // Create a link element to trigger the download
      const link = document.createElement("a")
      const objectUrl = URL.createObjectURL(blob)
      link.href = objectUrl
      link.download = `Numerology_Report_${user.dob.replace(/-/g, "")}_${user.name.replace(/\s+/g, "_")}.pdf` // Suggest a filename
      document.body.appendChild(link) // Required for Firefox
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Failed to download the report PDF. Please try again.")
    }
  }

  return (
    <tr>
      <td data-label='Name'>{user.name}</td>
      <td data-label='DOB'>{user.dob}</td>
      <td data-label='Gender'>{user.gender}</td>
      <td data-label='Bhagyank'>{bhagyank}</td>
      <td data-label='Moolank'>{moolank}</td>
      <td data-label='Kua'>{kua}</td>
      {/* Add cells for Name Numerology */}
      <td data-label='Destiny'>{destiny}</td>
      <td data-label='Soul Urge'>{soulUrge}</td>
      <td data-label='Personality'>{personality}</td>
      <td data-label='Grid'>
        {isLoading ? (
          "..." // Simple loading indicator
        ) : gridNumbersArray ? (
          <NumerologyGrid gridNumbers={gridNumbersArray} />
        ) : (
          "-" // Show dash if no grid or error
        )}
      </td>
      {/* Actions Cell */}
      <td data-label='Actions'>
        <button onClick={handleDownloadPdf} disabled={isLoading || !userData || userData.moolank === "Error"}>
          {isLoading ? "Loading..." : "Download PDF"}
        </button>
      </td>
    </tr>
  )
}

export default GridCalculator
