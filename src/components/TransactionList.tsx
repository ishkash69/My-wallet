import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { Transaction } from '../redux/slices/walletSlice';

export const TransactionList: React.FC = () => {
  const { transactions } = useAppSelector((state) => state.wallet);

  const openInExplorer = (hash: string) => {
    const url = `https://sepolia.etherscan.io/tx/${hash}`;
    Linking.openURL(url);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const statusColor =
      item.status === 'confirmed'
        ? '#4CAF50'
        : item.status === 'failed'
        ? '#F44336'
        : '#FF9800';

    const statusText =
      item.status === 'confirmed' ? '✓' : item.status === 'failed' ? '✗' : '⏱';

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => openInExplorer(item.hash)}
      >
        <View style={styles.transactionHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTo}>
              To: {item.to.substring(0, 10)}...
              {item.to.substring(item.to.length - 8)}
            </Text>
            <Text style={styles.transactionHash}>
              {item.hash.substring(0, 20)}...
            </Text>
          </View>
          <Text style={styles.transactionAmount}>{item.value} ETH</Text>
        </View>
        <Text style={styles.transactionDate}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.hash}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionHash: {
    fontSize: 11,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  transactionDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

