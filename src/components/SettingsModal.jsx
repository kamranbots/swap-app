import React from 'react';

function SettingsModal({ slippage, onSlippageChange, onClose }) {
  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal active" onClick={(e) => e.stopPropagation()}>
      <div className="settings-title">Settings</div>
      <div className="slippage-title">Slippage Tolerance</div>
      <div className="slippage-buttons">
        <button
          className={`slippage-btn ${slippage === 0.5 ? 'active' : ''}`}
            onClick={() => {
              onSlippageChange(0.5);
              onClose();
            }}
        >
          0.5%
        </button>
        <button
          className={`slippage-btn ${slippage === 2.5 ? 'active' : ''}`}
            onClick={() => {
              onSlippageChange(2.5);
              onClose();
            }}
        >
          2.5%
        </button>
        <button
          className={`slippage-btn ${slippage === 5.0 ? 'active' : ''}`}
            onClick={() => {
              onSlippageChange(5.0);
              onClose();
            }}
        >
          5.0%
        </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;

