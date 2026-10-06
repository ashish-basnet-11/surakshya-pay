import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  StatusBar,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect, useNavigation } from 'expo-router';
import Colors from '@/constants/Colors';
import { useGetUserTransaction } from '@/apis/transaction/get-user-transaction';
import Loader from '@/components/Loader';
import { formatDateTime } from '@/utils/helpers';

const Details = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch transaction data
  const { data: transactionsData, isLoading, error, refetch } = useGetUserTransaction({
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const transactions = transactionsData?.data || [];

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/(tabs)'); 
        return true;
      };
  
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
  
      return () => backHandler.remove();
    }, [])
  );

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    }
    return () => {
      if (parent) {
        parent.setOptions({ tabBarStyle: undefined });
      }
    };
  }, [navigation]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => {
      setRefreshing(false);
    });
  }, [refetch]);

  // Show loader while data is loading
  if (isLoading) {
    return <Loader />;
  }

  // Show error state if there's an error
  if (error || !transactionsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Transaction History</Text>
            <Text style={styles.headerSubtext}>Failed to load transactions</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF5722" />
          <Text style={styles.errorText}>Failed to load transactions</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Transaction History</Text>
            <Text style={styles.headerSubtext}>
              {transactions.length} transactions
            </Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.filterWrapper}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedPeriod === 'weekly' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedPeriod('weekly')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedPeriod === 'weekly' && styles.filterTextActive,
                ]}
              >
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedPeriod === 'monthly' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedPeriod('monthly')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedPeriod === 'monthly' && styles.filterTextActive,
                ]}
              >
                This Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
              colors={[Colors.primary]}
            />
          }
        >
          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
            </View>
          ) : (
            <View style={styles.transactionList}>
              {transactions.map((txn, index) => (
                <TransactionCard 
                  key={txn.id} 
                  transaction={txn} 
                  isLast={index === transactions.length - 1}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const TransactionCard = ({
  transaction,
  isLast,
}: {
  transaction: any;
  isLast: boolean;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#FF5722';
      default:
        return '#9E9E9E';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
        return 'arrow-down-circle';
      case 'WITHDRAWAL':
        return 'arrow-up-circle';
      case 'TRANSFER':
        // Determine if it's incoming or outgoing based on amount
        return transaction.amount > 0 ? 'arrow-down-circle' : 'arrow-up-circle';
      default:
        return 'help-circle';
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
        return '#4CAF50';
      case 'WITHDRAWAL':
        return '#FF5722';
      case 'TRANSFER':
        return amount > 0 ? '#4CAF50' : '#FF5722';
      default:
        return '#9E9E9E';
    }
  };

  const getTransactionType = (type: string, amount: number) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
        return 'received';
      case 'WITHDRAWAL':
        return 'sent';
      case 'TRANSFER':
        return amount > 0 ? 'received' : 'sent';
      default:
        return 'unknown';
    }
  };

  const getTransactionName = (transaction: any) => {
    if (transaction.transaction_type?.toUpperCase() === 'DEPOSIT') {
      return 'Deposit';
    } else if (transaction.transaction_type?.toUpperCase() === 'WITHDRAWAL') {
      return 'Withdrawal';
    } else if (transaction.transaction_type?.toUpperCase() === 'TRANSFER') {
      return transaction.amount > 0 ? 'Received' : 'Sent';
    }
    return transaction.description || 'Transaction';
  };

  const getAvatar = (transaction: any) => {
    const name = getTransactionName(transaction);
    return name.charAt(0).toUpperCase();
  };

  const transactionType = getTransactionType(transaction.transaction_type, transaction.amount);
  const transactionColor = getTransactionColor(transaction.transaction_type, transaction.amount);
  const transactionIcon = getTransactionIcon(transaction.transaction_type);
  const transactionName = getTransactionName(transaction);
  const avatar = getAvatar(transaction);

  return (
    <TouchableOpacity style={[styles.card, isLast && styles.cardLast]} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatar}</Text>
          </View>
          <View style={[
            styles.transactionIcon,
            { backgroundColor: transactionColor }
          ]}>
            <Ionicons 
              name={transactionIcon} 
              size={12} 
              color="#ffffff" 
            />
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionName} numberOfLines={1}>
              {transactionName}
            </Text>
            <Text style={[
              styles.amount,
              { color: transactionColor }
            ]}>
              {transaction.amount > 0 ? '+' : '-'}NPR {Math.abs(transaction.amount).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.transactionMeta}>
            <Text style={styles.category}>{transaction.category || 'General'}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(transaction.is_completed ? 'completed' : 'pending') }
              ]} />
              <Text style={[
                styles.status,
                { color: getStatusColor(transaction.is_completed ? 'completed' : 'pending') }
              ]}>
                {transaction.is_completed ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>

          <Text style={styles.dateTime}>
            {formatDateTime(transaction.timestamp)}
          </Text>

          {transaction.description ? (
            <Text style={styles.note} numberOfLines={2}>
              {transaction.description}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Details;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 20 : 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    paddingLeft: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  headerSubtext: {
    fontSize: 14,
    color: '#B3C5D7',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B3C5D7',
  },
  filterTextActive: {
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 40,
  },
  transactionList: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  cardLast: {
    borderBottomWidth: 0,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  transactionIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 12,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateTime: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  note: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF5722',
    marginTop: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#B3C5D7',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8E8E93',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#B3C5D7',
    marginTop: 5,
  },
});