import React from 'react';

const PremiumLock = ({ isLocked, onUnlock, price, children, isProcessing, buttonText }) => {
  return (
    <div className="premium-lock-wrapper">
      <div className={`premium-content ${isLocked ? 'premium-blur' : ''}`}>
        {children}
      </div>
      
      {isLocked && (
        <div className="premium-lock-overlay">
          <div className="lock-icon-container">
            <span className="lock-icon">🔒</span>
          </div>
          <h3>Unlock Premium Insights</h3>
          <p>Get detailed future predictions, remedies, and career roadmap.</p>
          <button 
            className="unlock-button" 
            onClick={onUnlock}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : (buttonText || `Unlock for ${price}`)}
          </button>
          <p className="secure-text">🔒 Secure Payment via Stripe</p>
        </div>
      )}
    </div>
  );
};

export default PremiumLock;
