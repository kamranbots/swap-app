import React from 'react';

function VirtualUSDT({ presetUsdValue, swapCompleted }) {
  // Show the preset USD value - this is what the user received from swap
  // Use the actual value from walletPreset
  const usdtAmount = presetUsdValue;

  // Debug logging
  console.log('VirtualUSDT render:', { swapCompleted, usdtAmount, presetUsdValue });

  // IMPORTANT: Show banner ONLY AFTER swap is completed successfully
  // This follows the PDF flow: "Locked USDT state appears only after swap is successful"
  if (!swapCompleted) {
    return null;
  }

  // Show the actual amount from the preset USD value
  const displayAmount = usdtAmount != null && usdtAmount > 0 ? usdtAmount : 0;

  return (
    <div className="virtual-usdt-container withdraw-banner">
      <div className="virtual-usdt-header">
        <div className="virtual-usdt-info">
          <span className="lock-icon">🔐</span>
          <div className="virtual-usdt-amount">
            <img
              src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
              alt="USDT"
              className="usdt-icon"
            />
            <span>{displayAmount.toLocaleString()} USDT</span>
          </div>
        </div>
        {/* Withdraw button is ALWAYS greyed out and not clickable as per PDF */}
        <button
          className="withdraw-btn"
          disabled={true}
          style={{
            cursor: 'not-allowed',
            opacity: 0.5,
            pointerEvents: 'none'
          }}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

export default VirtualUSDT;
