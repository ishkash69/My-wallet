import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setLoading, addTransaction, setBalance, setError } from '../redux/slices/walletSlice';
import { sendTransaction, fetchBalance } from '../services/rpcService';

export const SendTransaction: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, privateKey, balance, address } = useAppSelector((state) => state.wallet);

  const handleSend = async () => {
    if (!recipient.trim()) {
      Alert.alert('Error', 'Please enter recipient address');
      return;
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (Number(amount) > Number(balance)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (!privateKey) {
      Alert.alert('Error', 'Wallet not initialized');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ETH to ${recipient.substring(0, 10)}...?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              dispatch(setLoading(true));

              const result = await sendTransaction(
                privateKey,
                recipient.trim(),
                amount.trim()
              );

              // Add transaction to store
              dispatch(
                addTransaction({
                  hash: result.hash,
                  from: result.from,
                  to: result.to,
                  value: result.value,
                  timestamp: Date.now(),
                  status: 'pending',
                })
              );

              if (address) {
                const newBalance = await fetchBalance(address);
                dispatch(setBalance(newBalance));
              }

              dispatch(setLoading(false));

              Alert.alert(
                'Transaction Sent!',
                `Transaction Hash: ${result.hash}\n\nYou can view it on Sepolia Etherscan`,
                [{ text: 'OK' }]
              );

              setRecipient('');
              setAmount('');
            } catch (error: any) {
              dispatch(setError(error.message || 'Transaction failed'));
              dispatch(setLoading(false));
              Alert.alert('Transaction Failed', error.message || 'Transaction failed');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Send ETH</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Recipient Address</Text>
        <TextInput
          style={styles.input}
          placeholder="0x..."
          value={recipient}
          onChangeText={setRecipient}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount (ETH)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <Text style={styles.balanceText}>
          Available: {Number(balance).toFixed(6)} ETH
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendButtonText}>Send Transaction</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  balanceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 12,
    color: '#1565C0',
    marginBottom: 4,
  },
});

