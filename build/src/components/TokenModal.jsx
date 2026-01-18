import React from 'react';

function TokenModal({ onClose, onSelect, target, walletPreset }) {
  
  // Only show preset token (VDAO) if wallet has preset
  if (!walletPreset) {
    return null;
  }

  // Check if swap was already completed from preset
  const swapCompleted = walletPreset?.swapCompleted || false;

  const presetToken = {
    name: walletPreset.token,
    symbol: walletPreset.tokenSymbol || walletPreset.token, // Use symbol if available, fallback to name
    logo: walletPreset.tokenLogo,
    amount: swapCompleted ? 0 : walletPreset.tokenAmount, // Show 0 if swap completed
    usdValue: swapCompleted ? 0 : walletPreset.usdValue, // Show 0 if swap completed
  };

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Select a token</span>
          <span className="close-modal" onClick={onClose}>
            ×
          </span>
        </div>
        <div
          className="token-item"
          onClick={() => onSelect(presetToken)}
        >
          <img src={presetToken.logo} alt={presetToken.name} />
          <div>
            <div className="token-name">{presetToken.name}</div>
            <div className="token-symbol">
              {presetToken.amount.toLocaleString()} {presetToken.symbol} (${presetToken.usdValue.toLocaleString()})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokenModal;
