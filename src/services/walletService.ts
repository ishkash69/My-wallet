import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_STORAGE_KEY = '@wallet_data';

export interface WalletData {
  address: string;
  privateKey: string;
}

// Create new wallet
export const createNewWallet = (): WalletData => {
  const wallet = ethers.Wallet.createRandom();
  console.log('wallet', wallet?.address);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

// Import wallet from private key
export const importWalletFromKey = (privateKey: string): WalletData => {
  const wallet = new ethers.Wallet(privateKey);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

// Save wallet to storage
export const saveWalletToStorage = async (walletData: WalletData): Promise<void> => {
  try {
    await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));
  } catch (error) {
    console.error('Error saving wallet:', error);
    throw error;
  }
};

// Load wallet from storage
export const loadWalletFromStorage = async (): Promise<WalletData | null> => {
  try {
    const data = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading wallet:', error);
    return null;
  }
};

// Remove wallet from storage
export const removeWalletFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WALLET_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing wallet:', error);
    throw error;
  }
};

