import { Transaction, TransactionInstruction } from '@solana/web3.js';
import 'dotenv/config';
import RaydiumSwap from './RaydiumSwap';
import { swapConfig } from './swapConfig'; // Import the configuration

/**
 * Performs a token swap on the Raydium protocol.
 * Depending on the configuration, it can execute the swap or simulate it.
 */
const swap = async () => {
  /**
   * The RaydiumSwap instance for handling swaps.
   */
  const raydiumSwap = new RaydiumSwap(process.env.RPC_URL, process.env.WALLET_PRIVATE_KEY);
  console.log(`Raydium swap initialized`);
  console.log(`Swapping ${swapConfig.tokenAAmount} of ${swapConfig.tokenAAddress} for ${swapConfig.tokenBAddress}...`)

  /**
   * Load pool keys from the Raydium API to enable finding pool information.
   */
  await raydiumSwap.loadPoolKeys(swapConfig.liquidityFile);
  console.log(`Loaded pool keys`);

  /**
   * Find pool information for the given token pair.
   */
  const poolInfo = raydiumSwap.findPoolInfoForTokens(swapConfig.tokenAAddress, swapConfig.tokenBAddress);
  if (!poolInfo) {
    console.error('Pool info not found');
    return 'Pool info not found';
  } else {
    console.log('Found pool info');
  }

  /**
   * Prepare the swap transaction with the given parameters.
   */
  const tx = await raydiumSwap.getSwapTransaction(
    swapConfig.tokenBAddress,
    swapConfig.tokenAAmount,
    poolInfo,
    swapConfig.maxLamports, 
    "in"
  );

  /**
   * Prepare the swap transaction with the given parameters.
   */
  const txOut = await raydiumSwap.getSwapTransaction(
    swapConfig.tokenAAddress,
    swapConfig.tokenAAmount,
    poolInfo,
    swapConfig.maxLamports, 
    "in"
  );

  const splitTxIn = await raydiumSwap.createSplitTransactions(tx);
  const splitTxOut = await raydiumSwap.createSplitTransactions(txOut);

  const allTransactions = [...splitTxIn, ...splitTxOut];

  for (let i = 0; i < allTransactions.length; i++) {
    const tx = allTransactions[i];
    tx.recentBlockhash = (await raydiumSwap.connection.getLatestBlockhash()).blockhash
    tx.feePayer = raydiumSwap.wallet.payer.publicKey

    const signedTx = await raydiumSwap.wallet.signTransaction(tx);

    if (swapConfig.executeSwap) {
      try {
        const txid = await raydiumSwap.sendLegacyTransaction(signedTx as Transaction, swapConfig.maxRetries);
        console.log(`Transaction ${i + 1} succeeded: https://solscan.io/tx/${txid}`);
      } catch (error) {
        console.error(`Transaction ${i + 1} failed:`, error);
      }
    } else {
      try {
        const simRes = await raydiumSwap.simulateLegacyTransaction(signedTx as Transaction);
        console.log(`Simulation ${i + 1} result:`, simRes);
      } catch (error) {
        console.error(`Simulation ${i + 1} failed:`, error);
      }
    }
  }
};

swap();
