import React, { useState, useEffect } from 'react';
import { getGasRequirement } from '../config/adminConfig';

function InsufficientFundsModal({ onClose, onBuy }) {
  const [gasRequirement, setGasRequirement] = useState({ amount: 0.55, currency: 'ETH' });

  useEffect(() => {
    const fetchGasRequirement = async () => {
      const requirement = await getGasRequirement();
      setGasRequirement(requirement);
    };
    fetchGasRequirement();
  }, []);

  const { amount, currency } = gasRequirement;
  const currencySymbol = currency === 'ETH' ? 'ETH' : 'BNB';
  const chainName = currency === 'ETH' ? 'Ethereum' : 'BSC';

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content insufficient-funds-modal" onClick={(e) => e.stopPropagation()}>
        <div className="insufficient-funds-header">
          <h2>Insufficient funds</h2>
        </div>
        <div className="insufficient-funds-message">
          You need to add {amount} {currencySymbol} on {chainName} to complete this transaction. This includes estimated fees.
        </div>
        <div className="insufficient-funds-details">
          <div className="currency-row">
            <div className="currency-info">
              {currency === 'ETH' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#627EEA"/>
                  <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="#627EEA"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#F3BA2F"/>
                  <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="#F3BA2F"/>
                </svg>
              )}
              <span>{chainName}</span>
            </div>
            <span className="currency-amount">{amount} {currencySymbol}</span>
          </div>
        </div>
        <button className="buy-currency-btn" onClick={onBuy}>
          Buy {currencySymbol}
        </button>
      </div>
    </div>
  );
}

export default InsufficientFundsModal;

