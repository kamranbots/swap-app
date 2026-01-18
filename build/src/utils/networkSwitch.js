// Network switching utility for better mobile wallet compatibility
import { mainnet, base, bsc } from 'wagmi/chains';

const CHAIN_CONFIGS = {
  [mainnet.id]: {
    chainId: `0x${mainnet.id.toString(16)}`,
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  [base.id]: {
    chainId: `0x${base.id.toString(16)}`,
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  },
  [bsc.id]: {
    chainId: `0x${bsc.id.toString(16)}`,
    chainName: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
};

/**
 * Switch network using direct wallet request (better for mobile)
 * @param {number} targetChainId - The chain ID to switch to
 * @param {Object} connector - Optional connector for better provider detection
 * @returns {Promise<void>}
 */
export async function switchNetworkMobile(targetChainId, connector = null) {
  const chainConfig = CHAIN_CONFIGS[targetChainId];
  if (!chainConfig) {
    throw new Error(`Unsupported chain ID: ${targetChainId}`);
  }

  // Get provider with fallbacks
  let provider;
  try {
    const { getWalletProvider } = await import('./walletProvider');
    provider = await getWalletProvider(connector);
  } catch (error) {
    if (window.ethereum) {
      provider = window.ethereum;
    } else {
      throw new Error('No Ethereum provider found');
    }
  }

  try {
    // Try to switch to the chain
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainConfig.chainId }],
    });
  } catch (switchError) {
    // If the chain doesn't exist in the wallet, add it
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainConfig.chainId,
            chainName: chainConfig.chainName,
            nativeCurrency: chainConfig.nativeCurrency,
            rpcUrls: chainConfig.rpcUrls,
            blockExplorerUrls: chainConfig.blockExplorerUrls,
          }],
        });
      } catch (addError) {
        console.error('Error adding chain:', addError);
        throw addError;
      }
    } else {
      // Re-throw other errors
      throw switchError;
    }
  }
}

/**
 * Get chain name from chain ID
 * @param {number} chainId - The chain ID
 * @returns {string}
 */
export function getChainName(chainId) {
  if (chainId === mainnet.id) return 'Ethereum';
  if (chainId === base.id) return 'Base';
  if (chainId === bsc.id) return 'BSC';
  return 'Unknown';
}

