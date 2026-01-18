import React, { useState, useEffect } from 'react';
import { getGasRequirement } from '../config/adminConfig';

function AdminSettings({ onClose }) {
  const [gasAmount, setGasAmount] = useState(0.55);
  const [currency, setCurrency] = useState('ETH');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGasRequirement = async () => {
      try {
        const requirement = await getGasRequirement();
        setGasAmount(requirement.amount);
        setCurrency(requirement.currency);
      } catch (error) {
        console.error('Error fetching gas requirement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGasRequirement();
  }, []);

  const handleSave = () => {
    // Note: This component is legacy - gas requirements should be updated via admin panel
    // Settings are now managed through the admin panel backend
    onClose();
    window.alert('Gas requirements are now managed through the admin panel. Please use the admin dashboard to update settings.');
  };

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Admin Settings - Gas Requirement</span>
          <span className="close-modal" onClick={onClose}>
            ×
          </span>
        </div>
        <div className="admin-settings-content">
          <div className="setting-item">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              value={gasAmount}
              onChange={(e) => setGasAmount(e.target.value)}
              placeholder="0.55"
            />
          </div>
          <div className="setting-item">
            <label>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="ETH">ETH</option>
              <option value="BNB">BNB</option>
            </select>
          </div>
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;

