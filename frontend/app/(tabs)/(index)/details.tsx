import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import Colors from '@/constants/Colors';

// Sample multiple transactions for weekly and monthly periods
const weeklyTransactions = [
  {
    id: 'TXN1001',
    type: 'Received',
    amount: 250,
    from: 'John Doe',
    date: 'July 18, 2025',
    time: '10:24 AM',
    status: 'Completed',
    note: 'Thanks for your help!',
  },
  {
    id: 'TXN1002',
    type: 'Sent',
    amount: 120,
    from: 'Alice Brown',
    date: 'July 17, 2025',
    time: '2:00 PM',
    status: 'Completed',
    note: '',
  },
  {
    id: 'TXN1003',
    type: 'Received',
    amount: 300,
    from: 'Michael Lee',
    date: 'July 16, 2025',
    time: '11:15 AM',
    status: 'Pending',
    note: 'Awaiting confirmation',
  },
  // add more weekly transactions here...
];

const monthlyTransactions = [
  {
    id: 'TXN2001',
    type: 'Sent',
    amount: 500,
    from: 'Jane Smith',
    date: 'July 12, 2025',
    time: '3:15 PM',
    status: 'Completed',
    note: 'Monthly subscription payment',
  },
  {
    id: 'TXN2002',
    type: 'Received',
    amount: 450,
    from: 'Robert King',
    date: 'July 10, 2025',
    time: '10:00 AM',
    status: 'Completed',
    note: '',
  },
  {
    id: 'TXN2003',
    type: 'Sent',
    amount: 100,
    from: 'Sophia Green',
    date: 'July 5, 2025',
    time: '6:30 PM',
    status: 'Completed',
    note: 'Gift',
  },
  {
    id: 'TXN2004',
    type: 'Received',
    amount: 350,
    from: 'Emma Watson',
    date: 'July 1, 2025',
    time: '9:20 AM',
    status: 'Pending',
    note: '',
  },
  // add more monthly transactions here...
];

const Details = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>(
    'weekly'
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

  const transactions =
    selectedPeriod === 'weekly' ? weeklyTransactions : monthlyTransactions;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Transaction Details</Text>
      </View>

      {/* Period Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPeriod === 'weekly' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedPeriod('weekly')}
        >
          <Text
            style={[
              styles.filterText,
              selectedPeriod === 'weekly' && styles.filterTextActive,
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedPeriod === 'monthly' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedPeriod('monthly')}
        >
          <Text
            style={[
              styles.filterText,
              selectedPeriod === 'monthly' && styles.filterTextActive,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable list of small transaction cards */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {transactions.map((txn) => (
          <TransactionCard key={txn.id} transaction={txn} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const TransactionCard = ({
  transaction,
}: {
  transaction: {
    id: string;
    type: string;
    amount: number;
    from: string;
    date: string;
    time: string;
    status: string;
    note: string;
  };
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.amount}>₹{transaction.amount}</Text>
      <Text
        style={[
          styles.status,
          transaction.status === 'Completed' ? styles.statusCompleted : styles.statusPending,
        ]}
      >
        {transaction.status}
      </Text>
    </View>
    <Text style={styles.type}>{transaction.type}</Text>
    <Text style={styles.from}>From: {transaction.from}</Text>
    <Text style={styles.dateTime}>
      {transaction.date} at {transaction.time}
    </Text>
    {transaction.note ? <Text style={styles.note}>Note: {transaction.note}</Text> : null}
  </View>
);

export default Details;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 30,
    backgroundColor: '#2A3441',
    marginHorizontal: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    color: '#8B9DC3',
    fontWeight: '600',
    fontSize: 16,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusCompleted: {
    color: '#4caf50',
  },
  statusPending: {
    color: '#ff9800',
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 2,
  },
  from: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 2,
  },
  dateTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#bbb',
  },
});
