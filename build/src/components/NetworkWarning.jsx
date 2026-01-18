import React, { useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base, mainnet, bsc } from 'wagmi/chains';

const SUPPORTED_CHAINS = [mainnet.id, base.id, bsc.id];
const PREFERRED_CHAIN = bsc.id; // BNB/BSC is preferred

function NetworkWarning() {
  const { isConnected } = useAccount();
  const walletChainId = useChainId(); // Use wagmi's chainId (works with WalletConnect)
  const { switchChainAsync } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);
  
  // Check if current chain is supported
  const isSupported = walletChainId && SUPPORTED_CHAINS.includes(walletChainId);
  
  if (!isConnected || !walletChainId || isSupported) {
    return null; // Don't show warning if not connected, no chain, or on supported network
  }

  const handleSwitchToBNB = async () => {
    setIsSwitching(true);
    try {
      // Use wagmi's switchChainAsync - works with both injected and WalletConnect
      await switchChainAsync({ chainId: PREFERRED_CHAIN });
    } catch (error) {
      console.error('Error switching chain:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="network-warning-banner">
      <div className="warning-content">
        <span className="warning-icon">⚠️</span>
        <div className="warning-text-container">
          <span className="warning-title">Unsupported Network</span>
          <span className="warning-message">
            Please switch to BSC (BNB), Ethereum, or Base network to use this app.
          </span>
        </div>
        <button 
          className="switch-network-btn"
          onClick={handleSwitchToBNB}
          disabled={isSwitching}
        >
          {isSwitching ? 'Switching...' : 'Switch to BSC'}
        </button>
      </div>
    </div>
  );
}

export default NetworkWarning;

