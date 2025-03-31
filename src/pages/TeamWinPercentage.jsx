import React, { useState, useEffect } from "react"
import iplTeamsData from "../data/iplTeams.js" // Import from within src

// Read API URL from environment variable, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api" // Base API URL

function TeamWinPercentage() {
  const [selectedTeamKey1, setSelectedTeamKey1] = useState("") // Renamed state
  const [selectedTeamKey2, setSelectedTeamKey2] = useState("") // Added state for second team
  const [matchDate, setMatchDate] = useState("")
  const [result, setResult] = useState(null) // Will store { team1: {...}, team2: {...} }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [teamOptions, setTeamOptions] = useState([])

  // Populate team options on component mount
  useEffect(() => {
    const options = Object.entries(iplTeamsData).map(([key, team]) => ({
      value: key,
      label: team.fullName,
    }))
    setTeamOptions(options)
    // Set default selections for both dropdowns if options exist
    if (options.length > 0) {
      setSelectedTeamKey1(options[0].value)
      // Select the second team if available, otherwise the first again
      setSelectedTeamKey2(options.length > 1 ? options[1].value : options[0].value)
    }
  }, [])

  // Helper function to call the API for a single team
  const fetchWinPercentage = async (teamKey, matchDate) => {
    const response = await fetch(`${API_URL}/win-percentage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamKey, matchDate }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }
    return data
  }

  const handleCalculate = async () => {
    if (!selectedTeamKey1 || !selectedTeamKey2 || !matchDate) {
      setError("Please select both teams and enter a match date.")
      setResult(null)
      return
    }
    if (selectedTeamKey1 === selectedTeamKey2) {
      setError("Please select two different teams.")
      setResult(null)
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      // Fetch results for both teams concurrently
      const [result1, result2] = await Promise.all([
        fetchWinPercentage(selectedTeamKey1, matchDate),
        fetchWinPercentage(selectedTeamKey2, matchDate),
      ])

      setResult({ team1: result1, team2: result2 }) // Store both results
    } catch (err) {
      console.error("Calculation error:", err)
      setError(err.message || "Failed to calculate win percentage. Check API connection.")
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h2>IPL Team Matchup Calculator</h2> {/* Updated Title */}
      <div id='winPercentageInput' className='input-section'>
        {" "}
        {/* Reuse styling */}
        <h3>Select Teams and Match Date</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {" "}
          {/* Layout wrapper */}
          <label>Team 1: </label>
          <select
            value={selectedTeamKey1}
            onChange={(e) => setSelectedTeamKey1(e.target.value)}
            disabled={teamOptions.length === 0}
          >
            {teamOptions.length === 0 ? (
              <option>Loading...</option>
            ) : (
              teamOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>
          <label>Team 2:</label>
          <select
            value={selectedTeamKey2}
            onChange={(e) => setSelectedTeamKey2(e.target.value)}
            disabled={teamOptions.length === 0}
          >
            {teamOptions.length === 0 ? (
              <option>Loading...</option>
            ) : (
              teamOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>
          <label>
            Match Date:
            <input type='date' value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
          </label>
          <button onClick={handleCalculate} disabled={isLoading}>
            {isLoading ? "Calculating..." : "Calculate Win %"}
          </button>
        </div>
      </div>
      {error && (
        <div id='errorDisplay' style={{ color: "red", marginTop: "20px", textAlign: "center" }}>
          <p>Error: {error}</p>
        </div>
      )}
      {result && (
        <div id='resultDisplay' className='report-section'>
          <h3>Matchup Analysis for {result.team1.matchDate}</h3>
          <div style={{ display: "flex", justifyContent: "space-around", gap: "20px", flexWrap: "wrap" }}>
            {/* Team 1 Results */}
            <div
              style={{ flex: 1, minWidth: "250px", borderRight: "1px solid var(--border-color)", paddingRight: "15px" }}
            >
              <h4>{result.team1.team}</h4>
              <p>
                <small>(Captain: {result.team1.captain})</small>
              </p>
              <p>Captain Compatibility (CCS): {result.team1.captainCompatibilityScore}%</p>
              <p>Team Compatibility (TCS): {result.team1.teamCompatibilityScore}%</p>
              <p>Time Factor Score: {result.team1.timeFactorScore}%</p>
              <hr style={{ margin: "10px 0", borderColor: "var(--border-color)" }} />
              <p style={{ fontSize: "1.3em", fontWeight: "bold", color: "var(--accent-color)" }}>
                Win %: {result.team1.calculatedWinPercentage}%
              </p>
            </div>

            {/* Team 2 Results */}
            <div style={{ flex: 1, minWidth: "250px", paddingLeft: "15px" }}>
              <h4>{result.team2.team}</h4>
              <p>
                <small>(Captain: {result.team2.captain})</small>
              </p>
              <p>Captain Compatibility (CCS): {result.team2.captainCompatibilityScore}%</p>
              <p>Team Compatibility (TCS): {result.team2.teamCompatibilityScore}%</p>
              <p>Time Factor Score: {result.team2.timeFactorScore}%</p>
              <hr style={{ margin: "10px 0", borderColor: "var(--border-color)" }} />
              <p style={{ fontSize: "1.3em", fontWeight: "bold", color: "var(--accent-color)" }}>
                Win %: {result.team2.calculatedWinPercentage}%
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TeamWinPercentage
