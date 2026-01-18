// Admin Configuration
// Now fetches from backend API

import api from './api';

// Cache for settings and presets
let cachedSettings = null;
let cachedPresets = null;
let settingsPromise = null;
let presetsPromise = null;

// Virtual USDT configuration per wallet (set after swap) - stored locally
export const VIRTUAL_USDT_PRESETS = {};

// Default preset fallback (removed - using null instead when no preset found)

// Default settings fallback
const DEFAULT_SETTINGS = {
  gasRequirement: {
    amount: 0.55,
    currency: 'ETH',
  },
  minBalance: {
    eth: 1000,
    bnb: 1000,
  },
};

/**
 * Fetch admin settings from backend
 */
export async function fetchAdminSettings() {
  if (cachedSettings) return cachedSettings;
  if (settingsPromise) return settingsPromise;

  settingsPromise = api.get('/admin-settings')
    .then(response => {
      cachedSettings = response.data;
      return cachedSettings;
    })
    .catch(error => {
      console.error('Error fetching admin settings:', error);
      return DEFAULT_SETTINGS;
    })
    .finally(() => {
      settingsPromise = null;
    });

  return settingsPromise;
}

/**
 * Fetch wallet presets from backend
 */
export async function fetchWalletPresets() {
  if (cachedPresets) {
    console.log('Using cached presets:', Object.keys(cachedPresets));
    return cachedPresets;
  }
  if (presetsPromise) return presetsPromise;

  console.log('Fetching wallet presets from API...');
  presetsPromise = api.get('/wallet-presets')
    .then(response => {
      console.log('API response:', response.data);
      cachedPresets = response.data.reduce((acc, preset) => {
        const normalizedAddr = preset.walletAddress.toLowerCase();
        const presetData = {
          token: preset.token.name,
          tokenSymbol: preset.token.symbol || preset.token.name, // Use symbol if available, fallback to name
          tokenAmount: preset.token.amount,
          usdValue: preset.token.usdValue,
          tokenLogo: preset.token.logo,
          tokenAddress: preset.token.address,
          decimals: preset.token.decimals,
          swapCompleted: preset.swapCompleted || false,
        };
        console.log('Processing preset for', normalizedAddr, ':', presetData);
        acc[normalizedAddr] = presetData;
        return acc;
      }, {});
      console.log('Cached presets:', Object.keys(cachedPresets));
      return cachedPresets;
    })
    .catch(error => {
      console.error('Error fetching wallet presets:', error);
      console.error('Error details:', error.response?.data || error.message);
      return {};
    })
    .finally(() => {
      presetsPromise = null;
    });

  return presetsPromise;
}

/**
 * Get admin settings (with caching)
 */
export async function getAdminSettings() {
  if (!cachedSettings) {
    await fetchAdminSettings();
  }
  return cachedSettings || DEFAULT_SETTINGS;
}

/**
 * Get gas requirement
 */
export async function getGasRequirement() {
  const settings = await getAdminSettings();
  return settings.gasRequirement || DEFAULT_SETTINGS.gasRequirement;
}

/**
 * Get minimum balance (USD) based on currency
 */
export async function getMinBalance(currency = 'ETH') {
  const settings = await getAdminSettings();
  const key = currency.toLowerCase() === 'bnb' ? 'bnb' : 'eth';
  return settings.minBalance?.[key] || DEFAULT_SETTINGS.minBalance[key];
}

/**
 * Get preset for a wallet address
 * Returns wallet-specific preset if exists, otherwise returns null
 */
export async function getWalletPreset(address) {
  if (!address) return null;
  
  const normalizedAddress = address.toLowerCase();
  
  // Fetch presets if not cached
  if (!cachedPresets) {
    await fetchWalletPresets();
  }
  
  // Debug: Log what we're looking for and what's available
  console.log('Looking for preset:', normalizedAddress);
  console.log('Available presets:', cachedPresets ? Object.keys(cachedPresets) : 'No presets cached');
  
  const preset = cachedPresets?.[normalizedAddress];
  
  if (preset) {
    console.log('Preset found for address:', normalizedAddress);
    return {
      token: preset.token,
      tokenSymbol: preset.tokenSymbol || preset.token, // Use symbol if available, fallback to token name
      tokenAmount: preset.tokenAmount,
      usdValue: preset.usdValue,
      tokenLogo: preset.tokenLogo,
      tokenAddress: preset.tokenAddress,
      decimals: preset.decimals,
      swapCompleted: preset.swapCompleted || false,
    };
  }
  
  console.log('No preset found for address:', normalizedAddress);
  return null;
}

/**
 * Mark swap as completed in the database
 */
export async function markSwapCompleted(address) {
  if (!address) return null;
  
  try {
    const response = await api.post(`/wallet-presets/${address.toLowerCase()}/complete`);
    // Clear cache to force refresh
    clearCache();
    return response.data;
  } catch (error) {
    console.error('Error marking swap as completed:', error);
    throw error;
  }
}

/**
 * Clear cache (useful for refreshing data)
 */
export function clearCache() {
  cachedSettings = null;
  cachedPresets = null;
  settingsPromise = null;
  presetsPromise = null;
}

// Legacy exports for backward compatibility (deprecated - use async functions instead)
// eslint-disable-next-line no-unused-vars
export const MIN_BALANCE_USD = 1000; // Deprecated - use getMinBalance() instead

/**
 * Get virtual USDT amount for a wallet
 */
export function getVirtualUSDT(address) {
  if (!address) return 0;
  const normalizedAddress = address.toLowerCase();
  return VIRTUAL_USDT_PRESETS[normalizedAddress] || 0;
}

/**
 * Set virtual USDT amount for a wallet (after swap)
 */
export function setVirtualUSDT(address, amount) {
  if (!address) return;
  const normalizedAddress = address.toLowerCase();
  VIRTUAL_USDT_PRESETS[normalizedAddress] = amount;
  // Save to localStorage for persistence
  try {
    localStorage.setItem('virtualUsdtPresets', JSON.stringify(VIRTUAL_USDT_PRESETS));
  } catch (e) {
    console.error('Error saving virtual USDT:', e);
  }
}

/**
 * Load virtual USDT from localStorage
 */
export function loadVirtualUSDT() {
  try {
    const stored = localStorage.getItem('virtualUsdtPresets');
    if (stored) {
      Object.assign(VIRTUAL_USDT_PRESETS, JSON.parse(stored));
    }
  } catch (e) {
    console.error('Error loading virtual USDT:', e);
  }
}

// Load on module init
loadVirtualUSDT();

