import { ethers } from 'ethers';

// Sepolia testnet public RPC endpoints
const SEPOLIA_RPC_URLS = [
  'wss://ethereum-sepolia-rpc.publicnode.com',
  'https://eth-sepolia.g.alchemy.com/v2/demo',
  'https://sepolia.gateway.tenderly.co',
];

let currentRpcIndex = 0;

// Get Sepolia provider
export const getSepoliaProvider = (): ethers.JsonRpcProvider => {
  const rpcUrl = SEPOLIA_RPC_URLS[currentRpcIndex];
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Rotate to next RPC if current fails
const rotateRpc = () => {
  currentRpcIndex = (currentRpcIndex + 1) % SEPOLIA_RPC_URLS.length;
  console.log(`Rotating to RPC: ${SEPOLIA_RPC_URLS[currentRpcIndex]}`);
};

// Get balance
export const fetchBalance = async (address: string): Promise<string> => {
  let lastError: Error | null = null;

  for (let i = 0; i < SEPOLIA_RPC_URLS.length; i++) {
    try {
      const provider = getSepoliaProvider();
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      lastError = error;
      rotateRpc();
    }
  }

  throw lastError || new Error('Failed to fetch balance from all RPC endpoints');
};

// Send transaction
export const sendTransaction = async (
  privateKey: string,
  toAddress: string,
  amount: string
): Promise<{
  hash: string;
  from: string;
  to: string;
  value: string;
}> => {
  let lastError: Error | null = null;

  for (let i = 0; i < SEPOLIA_RPC_URLS.length; i++) {
    try {
      const provider = getSepoliaProvider();
      const wallet = new ethers.Wallet(privateKey, provider);

      // Validate address
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Parse amount
      const valueInWei = ethers.parseEther(amount);

      // Get fee data
      const feeData = await provider.getFeeData();

      // Send transaction
      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: valueInWei,
        gasLimit: 21000n,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });

      console.log('Transaction sent:', tx.hash);

      return {
        hash: tx.hash,
        from: wallet.address,
        to: toAddress,
        value: amount,
      };
    } catch (error: any) {
      lastError = error;
      rotateRpc();
    }
  }

  throw lastError || new Error('Failed to send transaction from all RPC endpoints');
};

// Get transaction receipt
export const getTransactionReceipt = async (
  txHash: string
): Promise<ethers.TransactionReceipt | null> => {
  try {
    const provider = getSepoliaProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt;
  } catch (error) {
    console.error('Error fetching transaction receipt:', error);
    return null;
  }
};

// Wait for transaction
export const waitForTransaction = async (
  txHash: string,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> => {
  try {
    const provider = getSepoliaProvider();
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    return null;
  }
};

// Get gas price
export const getGasPrice = async (): Promise<string> => {
  try {
    const provider = getSepoliaProvider();
    const feeData = await provider.getFeeData();
    if (feeData.gasPrice) {
      return ethers.formatUnits(feeData.gasPrice, 'gwei');
    }
    return '0';
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return '0';
  }
};

