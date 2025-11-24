import React from 'react';
import './ResultCard.css';

const ResultCard = ({ title, number, meaning, subtext, delay = 0 }) => {
  return (
    <div 
      className="result-card" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="result-card-content">
        <h3 className="result-title">{title}</h3>
        <div className="result-number-wrapper">
          <span className="result-number">{number}</span>
        </div>
        {meaning && <p className="result-meaning">{meaning}</p>}
        {subtext && <p className="result-subtext">{subtext}</p>}
      </div>
      <div className="result-card-glow"></div>
    </div>
  );
};

export default ResultCard;
