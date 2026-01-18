import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { formatEther } from 'viem';
import { base, mainnet, bsc } from 'wagmi/chains';

function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const walletChainId = useChainId(); // Use wagmi's chainId (works with WalletConnect)
  const { switchChainAsync } = useSwitchChain();
  const { data: balanceData } = useBalance({ address, enabled: isConnected });
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnectingCustom, setIsConnectingCustom] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const networkDropdownRef = useRef(null);
  const connectModalRef = useRef(null);

  // Detect mobile device
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const supportedChains = [mainnet.id, base.id, bsc.id];
  const isSupportedChain = walletChainId && supportedChains.includes(walletChainId);

  // Get WalletConnect connector
  const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect');
  const injectedConnector = connectors.find((c) => c.id === 'injected');

  // Check if MetaMask extension is available
  const hasMetaMaskExtension = typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;

  const getNetworkName = () => {
    if (walletChainId === mainnet.id) return 'Ethereum';
    if (walletChainId === base.id) return 'Base';
    if (walletChainId === bsc.id) return 'BSC';
    return 'Unknown';
  };

  const handleConnectWalletConnect = () => {
    if (walletConnectConnector) {
      connect({ connector: walletConnectConnector });
    }
  };

  // Direct MetaMask connection via window.ethereum
  const handleConnectMetaMask = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      alert('MetaMask not found! Please install MetaMask extension.');
      return;
    }

    setIsConnectingCustom(true);
    try {
      // Request accounts directly from MetaMask
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        console.log('MetaMask accounts:', accounts);
        // Now connect via wagmi injected connector
        if (injectedConnector) {
          await connect({ connector: injectedConnector });
        }
        setShowConnectModal(false);
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      if (error.code === 4001) {
        alert('Connection rejected by user');
      } else {
        alert('Failed to connect MetaMask. Please try again.');
      }
    } finally {
      setIsConnectingCustom(false);
    }
  };

  const handleConnectInjected = () => {
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  // Custom mobile wallet connection - more reliable for mobile
  const handleConnectCustom = async () => {
    if (!window.ethereum) {
      // On mobile without injected wallet, use WalletConnect instead
      if (walletConnectConnector) {
        connect({ connector: walletConnectConnector });
        setShowConnectModal(false);
      } else {
        alert('No wallet found. Please use WalletConnect or install a Web3 wallet.');
        setShowConnectModal(false);
      }
      return;
    }

    setIsConnectingCustom(true);
    try {
      // First check if MetaMask is unlocked
      const isUnlocked = await window.ethereum._metamask?.isUnlocked?.();
      console.log('MetaMask unlocked status:', isUnlocked);

      // Request account access directly from wallet
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts && accounts.length > 0) {
        console.log('Got accounts from MetaMask:', accounts[0]);
        // Connect via injected connector with retry
        let retryCount = 0;
        const maxRetries = 3;

        const attemptConnect = async () => {
          try {
            if (injectedConnector) {
              await connect({ connector: injectedConnector });
              console.log('Successfully connected via injected connector');
            }
          } catch (connectError) {
            console.error('Wagmi connect error (attempt ' + (retryCount + 1) + '):', connectError);
            retryCount++;
            if (retryCount < maxRetries) {
              console.log('Retrying connection...');
              await new Promise(resolve => setTimeout(resolve, 500));
              await attemptConnect();
            }
          }
        };

        // Small delay to let MetaMask state stabilize
        setTimeout(async () => {
          await attemptConnect();
        }, 200);

        setShowConnectModal(false);
      }
    } catch (error) {
      console.error('Custom connection error:', error);
      if (error.code === 4001) {
        alert('Connection rejected by user');
      } else if (error.message?.includes('Failed to connect to MetaMask')) {
        // MetaMask specific error - try WalletConnect as fallback
        console.log('MetaMask connection failed, trying WalletConnect...');
        if (walletConnectConnector) {
          try {
            connect({ connector: walletConnectConnector });
            setShowConnectModal(false);
            return;
          } catch (wcError) {
            console.error('WalletConnect fallback failed:', wcError);
          }
        }
        alert('MetaMask connection failed. Please try:\n1. Refresh the page\n2. Unlock MetaMask\n3. Use WalletConnect instead');
      } else {
        alert('Failed to connect wallet. Please refresh and try again.');
      }
    } finally {
      setIsConnectingCustom(false);
    }
  };

  // Format balance
  const formatBalance = () => {
    if (!balanceData) return '0.00';
    const balance = parseFloat(formatEther(balanceData.value));
    if (balance < 0.01) {
      return balance.toFixed(6);
    }
    return balance.toFixed(4);
  };

  const getBalanceSymbol = () => {
    if (walletChainId === bsc.id) return 'BNB';
    if (walletChainId === base.id) return 'ETH';
    if (walletChainId === mainnet.id) return 'ETH';
    return 'ETH';
  };

  const handleSwitchChain = async (targetChainId) => {
    setIsSwitchingNetwork(true);
    setShowNetworkModal(false);

    try {
      // Use wagmi's switchChainAsync - works with both injected and WalletConnect
      await switchChainAsync({ chainId: targetChainId });
    } catch (error) {
      console.error('Error switching chain:', error);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (networkDropdownRef.current && !networkDropdownRef.current.contains(event.target)) {
        setShowNetworkModal(false);
      }
      if (connectModalRef.current && !connectModalRef.current.contains(event.target)) {
        setShowConnectModal(false);
      }
    };

    if (showNetworkModal || showConnectModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNetworkModal, showConnectModal]);

  return (
    <header>
      <div className="logo">Swap|App</div>
      <div className="header-right" style={{ position: 'relative' }}>
        {isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isSupportedChain && (
              <select
                value={walletChainId || ''}
                onChange={(e) => handleSwitchChain(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value={bsc.id}>Switch to BSC</option>
                <option value={base.id}>Switch to Base</option>
                <option value={mainnet.id}>Switch to Ethereum</option>
              </select>
            )}
            {isSupportedChain && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Balance Display */}
                {isConnected && balanceData && (
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#f0f0f0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                  }}>
                    {formatBalance()} {getBalanceSymbol()}
                  </div>
                )}
                {/* Network Dropdown */}
                <div style={{ position: 'relative' }} ref={networkDropdownRef}>
                  <button
                    onClick={() => setShowNetworkModal(!showNetworkModal)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    <span>{getNetworkName()}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ transform: showNetworkModal ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <path d="M6 9L1 4H11L6 9Z" fill="currentColor" />
                    </svg>
                  </button>
                  {showNetworkModal && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '45px',
                        left: '0',
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        minWidth: '150px',
                      }}
                    >
                      <div style={{ padding: '8px 0' }}>
                        <button
                          onClick={() => handleSwitchChain(bsc.id)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 16px',
                            border: 'none',
                            background: walletChainId === bsc.id ? '#f0f0f0' : 'transparent',
                            color: walletChainId === bsc.id ? '#6366f1' : '#333',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                            fontWeight: walletChainId === bsc.id ? '600' : '400',
                          }}
                          onMouseEnter={(e) => {
                            if (walletChainId !== bsc.id) {
                              e.target.style.background = '#f9f9f9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (walletChainId !== bsc.id) {
                              e.target.style.background = 'transparent';
                            }
                          }}
                        >
                          BSC
                        </button>
                        <button
                          onClick={() => handleSwitchChain(base.id)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 16px',
                            border: 'none',
                            background: walletChainId === base.id ? '#f0f0f0' : 'transparent',
                            color: walletChainId === base.id ? '#6366f1' : '#333',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                            fontWeight: walletChainId === base.id ? '600' : '400',
                          }}
                          onMouseEnter={(e) => {
                            if (walletChainId !== base.id) {
                              e.target.style.background = '#f9f9f9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (walletChainId !== base.id) {
                              e.target.style.background = 'transparent';
                            }
                          }}
                        >
                          Base
                        </button>
                        <button
                          onClick={() => handleSwitchChain(mainnet.id)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 16px',
                            border: 'none',
                            background: walletChainId === mainnet.id ? '#f0f0f0' : 'transparent',
                            color: walletChainId === mainnet.id ? '#6366f1' : '#333',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                            fontWeight: walletChainId === mainnet.id ? '600' : '400',
                          }}
                          onMouseEnter={(e) => {
                            if (walletChainId !== mainnet.id) {
                              e.target.style.background = '#f9f9f9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (walletChainId !== mainnet.id) {
                              e.target.style.background = 'transparent';
                            }
                          }}
                        >
                          Ethereum
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#6366f1',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {formatAddress(address)}
            </button>
            <button
              onClick={() => disconnect()}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative' }} ref={connectModalRef}>
            <button
              onClick={() => setShowConnectModal(!showConnectModal)}
              disabled={isPending || isConnectingCustom}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#6366f1',
                color: 'white',
                cursor: (isPending || isConnectingCustom) ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              {(isPending || isConnectingCustom) ? 'Connecting...' : 'Connect Wallet'}
            </button>
            {showConnectModal && (
              <div
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  minWidth: isMobile ? '200px' : '250px',
                  padding: '12px',
                }}
              >
                <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '16px' }}>Select Wallet</div>

                {/* MetaMask Extension Button - Desktop only */}
                {hasMetaMaskExtension && !isMobile && (
                  <button
                    onClick={handleConnectMetaMask}
                    disabled={isConnectingCustom || isPending}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '12px',
                      marginBottom: '8px',
                      border: 'none',
                      background: '#f6851b',
                      color: 'white',
                      cursor: (isConnectingCustom || isPending) ? 'not-allowed' : 'pointer',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: 'left',
                    }}
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                      alt="MetaMask"
                      style={{ width: '20px', height: '20px' }}
                    />
                    {isConnectingCustom ? 'Connecting...' : 'MetaMask'}
                  </button>
                )}

                {/* Custom Mobile Connection - More reliable */}
                {isMobile && window.ethereum && (
                  <button
                    onClick={handleConnectCustom}
                    disabled={isConnectingCustom || isPending}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px',
                      marginBottom: '8px',
                      border: 'none',
                      background: '#6366f1',
                      color: 'white',
                      cursor: (isConnectingCustom || isPending) ? 'not-allowed' : 'pointer',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: 'left',
                    }}
                  >
                    {isConnectingCustom ? 'Connecting...' : '📱 Mobile Wallet'}
                  </button>
                )}

                {/* WalletConnect Button */}
                {walletConnectConnector && (
                  <button
                    onClick={() => {
                      handleConnectWalletConnect();
                      setShowConnectModal(false);
                    }}
                    disabled={isPending || isConnectingCustom}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px',
                      marginBottom: '8px',
                      border: '1px solid #ccc',
                      background: '#3b99fc',
                      color: 'white',
                      cursor: (isPending || isConnectingCustom) ? 'not-allowed' : 'pointer',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: 'left',
                    }}
                  >
                    🔗 WalletConnect (QR Code)
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
