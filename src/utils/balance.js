import { CHAINS } from '../config/constants';

/**
 * Get token price from CoinGecko
 */
export async function getTokenPrice(chainName) {
  const chain = CHAINS[chainName];
  if (!chain) return 0;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${chain.coingeckoId}&vs_currencies=usd`
    );
    const data = await response.json();
    return data[chain.coingeckoId]?.usd || 0;
  } catch (error) {
    console.error('Error fetching price:', error);
    // Fallback prices
    const fallbackPrices = {
      ethereum: 3300,
      base: 3300, // Base uses ETH, so same price
      bsc: 700,
      tron: 0.16,
      solana: 180,
    };
    return fallbackPrices[chainName] || 0;
  }
}

/**
 * Calculate balance in USD for EVM chains
 */
export async function getEVMBalanceUSD(address, chainId, web3) {
  try {
    const chainName = chainId === 56 ? 'bsc' : chainId === 8453 ? 'base' : 'ethereum';
    const price = await getTokenPrice(chainName);
    const wei = await web3.eth.getBalance(address);
    const balance = parseFloat(web3.utils.fromWei(wei, 'ether'));
    return balance * price;
  } catch (error) {
    console.error('Error getting EVM balance:', error);
    return 0;
  }
}

/**
 * Calculate balance in USD for Solana
 */
export async function getSolanaBalanceUSD(address, connection) {
  try {
    const price = await getTokenPrice('solana');
    const { PublicKey } = await import('@solana/web3.js');
    const publicKey = new PublicKey(address);
    const lamports = await connection.getBalance(publicKey);
    const balance = lamports / 1e9;
    return balance * price;
  } catch (error) {
    console.error('Error getting Solana balance:', error);
    return 0;
  }
}

/**
 * Calculate balance in USD for Tron
 */
export async function getTronBalanceUSD(address, tronWeb) {
  try {
    const price = await getTokenPrice('tron');
    const trx = await tronWeb.trx.getBalance(address);
    const balance = trx / 1e6;
    return balance * price;
  } catch (error) {
    console.error('Error getting Tron balance:', error);
    return 0;
  }
}

