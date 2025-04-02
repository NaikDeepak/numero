import React from 'react';
import PropTypes from 'prop-types';

// --- Define Coordinates for Highlighting ---

// For Rectangles (Vertical Planes Only) - [x, y, width, height] percentages
const analysisRectMap = {
  "Thought Plane": [0, 0, 33.3, 100],
  "Will Plane": [33.3, 0, 33.3, 100],
  "Action Plane": [66.6, 0, 33.3, 100],
};

// For Lines (Horizontal Planes, Diagonals, Small Arrows) - [x1, y1, x2, y2] percentages
const analysisLineMap = {
  // Horizontal Planes (as lines)
  "Mental Plane": [5, 16.6, 95, 16.6],
  "Emotional Plane": [5, 50, 95, 50],
  "Practical Plane": [5, 83.3, 95, 83.3],
  // Diagonals (Rajyogs)
  "Success Plane (Golden Rajyog)": [5, 5, 95, 95],
  "Success Plane (Silver Rajyog)": [95, 5, 5, 95],
  // Small Arrows
  "Arrow of Balance (7-1)": [50, 83.3, 83.3, 83.3], // Line between 1 and 7 centers
  "Arrow of Litigation (3-9)": [16.6, 50, 50, 16.6], // Line between 3 and 9 centers
  // Arrow names corresponding to Horizontal Planes
  "Arrow of Spirituality (3-5-7)": [5, 50, 95, 50], // Same as Emotional Plane line
  "Arrow of Intellect (4-9-2)": [5, 16.6, 95, 16.6], // Same as Mental Plane line
  "Arrow of Practicality (8-1-6)": [5, 83.3, 95, 83.3], // Same as Practical Plane line
};


/**
 * Renders a 3x3 Lo Shu grid based on provided numbers, highlighting completed arrows/planes.
 * @param {object} props - Component props.
 * @param {number[]} [props.gridNumbers=[]] - Array of numbers to display in the grid.
 * @param {object[]} [props.gridAnalysis=[]] - Array of analysis results for highlighting.
 */
function NumerologyGrid({ gridNumbers = [], gridAnalysis = [] }) { // Add gridAnalysis prop
  // Lo Shu Grid position mapping (Number -> Cell Index 0-8)
  // 4 9 2  -> 0 1 2
  // 3 5 7  -> 3 4 5
  // 8 1 6  -> 6 7 8
  const positionMap = { 4: 0, 9: 1, 2: 2, 3: 3, 5: 4, 7: 5, 8: 6, 1: 7, 6: 8 };
  let cells = Array(9).fill(''); // Initialize 9 empty cells

  // Populate cell contents based on gridNumbers
  if (gridNumbers && Array.isArray(gridNumbers)) {
    gridNumbers.forEach(num => {
      const number = parseInt(num, 10); // Ensure it's a number
      if (!isNaN(number) && number !== 0 && positionMap.hasOwnProperty(number)) {
        let cellIndex = positionMap[number];
        // Append number with space if cell already has content
        cells[cellIndex] += (cells[cellIndex] ? ' ' : '') + number;
      }
    });
  }

  return (
    <div className="numerology-grid-container"> {/* Added container for SVG overlay */}
      <div className="numerology-grid">
        {cells.map((content, index) => (
          <div key={index} className="grid-cell">
            {content || ''} {/* Render content or empty string */}
          </div>
        ))}
      </div>
      {/* SVG Overlay for Highlighting Arrows/Planes */}
      <svg className="grid-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
        {gridAnalysis.map((analysisItem, index) => {
          const rectCoords = analysisRectMap[analysisItem.name]; // Check for rectangle first
          const lineCoords = analysisLineMap[analysisItem.name]; // Then check for line
          // Create CSS class from category (e.g., 'plane-vertical-rect', 'arrow-line')
          const categoryClass = analysisItem.category?.toLowerCase().replace(/[\s()]/g, '-') || 'analysis';

          if (rectCoords) {
            // Render a rectangle for vertical planes
            return (
              <rect
                key={`${analysisItem.name}-${index}-rect`}
                x={`${rectCoords[0]}%`}
                y={`${rectCoords[1]}%`}
                width={`${rectCoords[2]}%`}
                height={`${rectCoords[3]}%`}
                className={`analysis-rect ${categoryClass}-rect`} // Use specific class
              />
            );
          } else if (lineCoords) {
            // Render a line for horizontal planes, diagonals, small arrows
            return (
              <line
                key={`${analysisItem.name}-${index}-line`}
                x1={`${lineCoords[0]}%`}
                y1={`${lineCoords[1]}%`}
                x2={`${lineCoords[2]}%`}
                y2={`${lineCoords[3]}%`}
                className={`analysis-line ${categoryClass}-line`} // Use specific class
              />
            );
          }
          return null; // Don't render if no coordinates found
        })}
      </svg>
    </div>
  );
}

// Define prop types for type checking and documentation
NumerologyGrid.propTypes = {
  gridNumbers: PropTypes.arrayOf(PropTypes.number),
  gridAnalysis: PropTypes.arrayOf(PropTypes.shape({ // Add prop type for analysis
      name: PropTypes.string,
      category: PropTypes.string,
      interpretation: PropTypes.string,
      numbers: PropTypes.arrayOf(PropTypes.number)
  }))
};

// Default prop for gridAnalysis
NumerologyGrid.defaultProps = {
    gridAnalysis: [],
};


export default NumerologyGrid;
