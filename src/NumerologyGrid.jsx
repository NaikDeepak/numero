import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a 3x3 Lo Shu grid based on provided numbers.
 * @param {object} props - Component props.
 * @param {number[]} props.gridNumbers - Array of numbers to display in the grid.
 */
function NumerologyGrid({ gridNumbers }) {
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
    <div className="numerology-grid">
      {cells.map((content, index) => (
        <div key={index} className="grid-cell">
          {content || ''} {/* Render content or empty string */}
        </div>
      ))}
    </div>
  );
}

// Define prop types for type checking and documentation
NumerologyGrid.propTypes = {
  gridNumbers: PropTypes.arrayOf(PropTypes.number),
};

// Default props for when gridNumbers might be undefined or null
NumerologyGrid.defaultProps = {
  gridNumbers: [],
};

export default NumerologyGrid;
