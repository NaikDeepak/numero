// src/numerologyUtils.js - Frontend utilities (calculation logic moved to backend)

// Optional: Keep helper functions if they are used elsewhere in the frontend,
// otherwise this file can be simplified or removed if only formatGridNumbers remains.

// Optional: Helper to format grid numbers array for display/export
export function formatGridNumbers(gridNumbers) {
  if (!gridNumbers || gridNumbers.length === 0) return "-";
  return gridNumbers.join(", "); // Simple comma-separated string
}
