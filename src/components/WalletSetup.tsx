import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setWallet, setLoading, setError } from '../redux/slices/walletSlice';
import {
  createNewWallet,
  importWalletFromKey,
  saveWalletToStorage,
} from '../services/walletService';

export const WalletSetup: React.FC = () => {
  const [mode, setMode] = useState<'main' | 'import'>('main');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.wallet);

  const handleCreateWallet = async () => {
    try {
      dispatch(setLoading(true));
      
      const walletData = createNewWallet();
      await saveWalletToStorage(walletData);
      
      dispatch(setWallet(walletData));
      dispatch(setLoading(false));
      
      Alert.alert(
        'Wallet Created!',
        `Your wallet has been created.\n\nAddress: ${walletData.address}\n\nPrivate Key: ${walletData.privateKey}\n\n⚠️ IMPORTANT: Save your private key securely!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to create wallet'));
      Alert.alert('Error', error.message || 'Failed to create wallet');
    }
  };

  const handleImportWallet = async () => {
    if (!privateKeyInput.trim()) {
      Alert.alert('Error', 'Please enter a private key');
      return;
    }

    try {
      dispatch(setLoading(true));
      
      const walletData = importWalletFromKey(privateKeyInput.trim());
      await saveWalletToStorage(walletData);
      
      dispatch(setWallet(walletData));
      dispatch(setLoading(false));
      
      Alert.alert('Wallet Imported!', `Address: ${walletData.address}`);
      setPrivateKeyInput('');
      setMode('main');
    } catch (error: any) {
      dispatch(setError('Invalid private key'));
      Alert.alert('Error', 'Invalid private key');
      dispatch(setLoading(false));
    }
  };

  if (mode === 'import') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Import Wallet</Text>
        <Text style={styles.subtitle}>Enter your private key to import your wallet</Text>

        <TextInput
          style={styles.input}
          placeholder="Private Key (0x...)"
          value={privateKeyInput}
          onChangeText={setPrivateKeyInput}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleImportWallet}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Import Wallet</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            setMode('main');
            setPrivateKeyInput('');
          }}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My Wallet</Text>
      <Text style={styles.subtitle}>Create a new wallet or import an existing one</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCreateWallet}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Create New Wallet</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setMode('import')}
        disabled={isLoading}
      >
        <Text style={styles.secondaryButtonText}>Import Wallet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

