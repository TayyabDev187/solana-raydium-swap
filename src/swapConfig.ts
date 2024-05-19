export const swapConfig = {
  executeSwap: true, // Send tx when true, simulate tx when false
  useVersionedTransaction: false,
  tokenAAmount: 0.00001, // Swap 0.0000001 SOL for USDT in this example
  tokenAAddress: "So11111111111111111111111111111111111111112", // Token to swap for the other, SOL in this case
  tokenBAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC address
  maxLamports: 1500000, // Micro lamports for priority fee
  direction: "out" as "in" | "out", // Swap direction: 'in' or 'out'
  liquidityFile: "https://api.raydium.io/v2/sdk/liquidity/mainnet.json",
  maxRetries: 20,
};
