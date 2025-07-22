import React, { useLayoutEffect, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import Colors from '@/constants/Colors';

const weeklyTransactions = [
  {
    id: 'TXN1001',
    type: 'received',
    amount: 250,
    from: 'John Doe',
    date: 'July 18, 2025',
    time: '10:24 AM',
    status: 'completed',
    note: 'Thanks for your help!',
    category: 'Personal',
    avatar: 'J',
  },
  {
    id: 'TXN1002',
    type: 'sent',
    amount: 120,
    to: 'Alice Brown',
    date: 'July 17, 2025',
    time: '2:00 PM',
    status: 'completed',
    note: 'Coffee payment',
    category: 'Food & Dining',
    avatar: 'A',
  },
  {
    id: 'TXN1003',
    type: 'received',
    amount: 300,
    from: 'Michael Lee',
    date: 'July 16, 2025',
    time: '11:15 AM',
    status: 'pending',
    note: 'Freelance project payment',
    category: 'Work',
    avatar: 'M',
  },
  {
    id: 'TXN1004',
    type: 'sent',
    amount: 85,
    to: 'Uber Technologies',
    date: 'July 15, 2025',
    time: '9:30 PM',
    status: 'completed',
    note: '',
    category: 'Transportation',
    avatar: 'U',
  },
];

const monthlyTransactions = [
  {
    id: 'TXN2001',
    type: 'sent',
    amount: 500,
    to: 'Netflix Inc.',
    date: 'July 12, 2025',
    time: '3:15 PM',
    status: 'completed',
    note: 'Monthly subscription payment',
    category: 'Entertainment',
    avatar: 'N',
  },
  {
    id: 'TXN2002',
    type: 'received',
    amount: 1450,
    from: 'Acme Corp',
    date: 'July 10, 2025',
    time: '10:00 AM',
    status: 'completed',
    note: 'Salary payment',
    category: 'Income',
    avatar: 'A',
  },
  {
    id: 'TXN2003',
    type: 'sent',
    amount: 100,
    to: 'Sophia Green',
    date: 'July 5, 2025',
    time: '6:30 PM',
    status: 'completed',
    note: 'Birthday gift',
    category: 'Personal',
    avatar: 'S',
  },
  {
    id: 'TXN2004',
    type: 'received',
    amount: 350,
    from: 'Emma Watson',
    date: 'July 1, 2025',
    time: '9:20 AM',
    status: 'pending',
    note: 'Shared expense refund',
    category: 'Personal',
    avatar: 'E',
  },
];

const Details = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [refreshing, setRefreshing] = useState(false);

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

  const transactions = selectedPeriod === 'weekly' ? weeklyTransactions : monthlyTransactions;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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
          <View style={styles.transactionList}>
            {transactions.map((txn, index) => (
              <TransactionCard 
                key={txn.id} 
                transaction={txn} 
                isLast={index === transactions.length - 1}
              />
            ))}
          </View>
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
    return type === 'received' ? 'arrow-down-circle' : 'arrow-up-circle';
  };

  const getTransactionColor = (type: string) => {
    return type === 'received' ? '#4CAF50' : '#FF5722';
  };

  return (
    <TouchableOpacity style={[styles.card, isLast && styles.cardLast]} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{transaction.avatar}</Text>
          </View>
          <View style={[
            styles.transactionIcon,
            { backgroundColor: getTransactionColor(transaction.type) }
          ]}>
            <Ionicons 
              name={getTransactionIcon(transaction.type)} 
              size={12} 
              color="#ffffff" 
            />
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionName} numberOfLines={1}>
              {transaction.from || transaction.to}
            </Text>
            <Text style={[
              styles.amount,
              { color: getTransactionColor(transaction.type) }
            ]}>
              {transaction.type === 'received' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.transactionMeta}>
            <Text style={styles.category}>{transaction.category}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(transaction.status) }
              ]} />
              <Text style={[
                styles.status,
                { color: getStatusColor(transaction.status) }
              ]}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.dateTime}>
            {transaction.date} • {transaction.time}
          </Text>

          {transaction.note ? (
            <Text style={styles.note} numberOfLines={2}>
              {transaction.note}
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
    marginTop: Platform.OS === 'ios' ? 50 : 40,
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
});