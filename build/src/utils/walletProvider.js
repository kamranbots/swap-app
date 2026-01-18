/**
 * Get the wallet provider with proper fallbacks for mobile and desktop
 * @param {Object} connector - Wagmi connector object
 * @returns {Promise<Object>} - The provider object
 */
export async function getWalletProvider(connector) {
  // Try to get provider from connector first (works best for mobile wallets)
  if (connector && typeof connector.getProvider === 'function') {
    try {
      const provider = await connector.getProvider();
      if (provider && provider.request) {
        console.log('Using provider from connector');
        return provider;
      }
    } catch (error) {
      console.log('Could not get provider from connector:', error);
    }
  }

  // Fallback to window.ethereum (standard for most wallets)
  if (typeof window !== 'undefined' && window.ethereum) {
    console.log('Using window.ethereum provider');
    return window.ethereum;
  }

  // Fallback to window.web3 (for older wallets)
  if (typeof window !== 'undefined' && window.web3 && window.web3.currentProvider) {
    console.log('Using window.web3.currentProvider');
    return window.web3.currentProvider;
  }

  throw new Error('No wallet provider found');
}

/**
 * Get current chain ID from provider
 * @param {Object} provider - The provider object
 * @returns {Promise<number>} - The chain ID
 */
export async function getProviderChainId(provider) {
  try {
    // Try standard request method
    const chainIdHex = await provider.request({ method: 'eth_chainId' });
    return parseInt(chainIdHex, 16);
  } catch (error) {
    // Fallback: try to read from provider.chainId
    if (provider.chainId) {
      const chainId = typeof provider.chainId === 'string' 
        ? parseInt(provider.chainId, 16) 
        : provider.chainId;
      return chainId;
    }
    throw new Error('Could not get chain ID from provider');
  }
}


