/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Clipboard,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { useAppDispatch, useAppSelector } from './src/redux/hooks';
import {
  setWallet,
  setBalance,
  setLoading,
  clearWallet,
} from './src/redux/slices/walletSlice';
import { loadWalletFromStorage, removeWalletFromStorage } from './src/services/walletService';
import { fetchBalance } from './src/services/rpcService';
import { WalletSetup } from './src/components/WalletSetup';
import { SendTransaction } from './src/components/SendTransaction';
import { TransactionList } from './src/components/TransactionList';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { address, balance, isLoading } = useAppSelector((state) => state.wallet);
  const [activeTab, setActiveTab] = useState<'wallet' | 'send' | 'transactions'>('wallet');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    if (address) {
      refreshBalance();

      const interval = setInterval(() => {
        refreshBalance();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const loadWallet = async () => {
    const wallet = await loadWalletFromStorage();
    if (wallet) {
      dispatch(setWallet(wallet));
    }
  };

  const refreshBalance = async () => {
    if (address) {
      try {
        const newBalance = await fetchBalance(address);
        dispatch(setBalance(newBalance));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Make sure you have saved your private key!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await removeWalletFromStorage();
            dispatch(clearWallet());
          },
        },
      ]
    );
  };

  if (!address) {
    return <WalletSetup />;
  }

  return (
    <View style={styles.container}>
      <View style={{ marginTop: safeAreaInsets.top }} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerNetwork}>Sepolia Testnet</Text>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{Number(balance).toFixed(6)} ETH</Text>
          <View style={styles.addressContainer}>
          <Text style={styles.addressText}>
            {address.substring(0, 10)}...{address.substring(address.length - 8)}
          </Text>
          <TouchableOpacity onPress={() =>{ 
            Clipboard.setString(address)
            Alert.alert('Address copied to clipboard');
            }}>
            <Text style= {styles.copyAddressButton}>📋</Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'wallet' && styles.activeTab]}
          onPress={() => setActiveTab('wallet')}
        >
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>
            Wallet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'send' && styles.activeTab]}
          onPress={() => setActiveTab('send')}
        >
          <Text style={[styles.tabText, activeTab === 'send' && styles.activeTabText]}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'wallet' && (
          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            contentContainerStyle={styles.walletContent}
          >
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>💼 Wallet Info</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Network:</Text>
                <Text style={styles.infoValue}>Sepolia Testnet</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Chain ID:</Text>
                <Text style={styles.infoValue}>11155111</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Balance:</Text>
                <Text style={styles.infoValue}>{Number(balance).toFixed(6)} ETH</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {activeTab === 'send' && <SendTransaction />}

        {activeTab === 'transactions' && <TransactionList />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
  },
  logoutText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  headerNetwork: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 16,
  },
  addressText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    fontFamily: 'monospace',
  },
  copyAddressButton: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    fontFamily: 'monospace',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  walletContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  linkText: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;
