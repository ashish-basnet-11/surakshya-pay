import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const transactions = [
  { id: '1', type: 'Received', amount: 50, from: 'John', time: '2 mins ago' },
  { id: '2', type: 'Sent', amount: 20, to: 'Alice', time: '1 hour ago' },
  { id: '3', type: 'Received', amount: 100, from: 'Bank', time: 'Yesterday' },
  { id: '4', type: 'Sent', amount: 10, to: 'Bob', time: '2 days ago' },
];

const Notification = () => {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof transactions[0] }) => {
    const isReceived = item.type === 'Received';

    return (
      <View style={styles.transactionCard}>
        {/* Left colored bar */}
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: isReceived ? '#4CAF50' : '#F44336' },
          ]}
        />
        <View style={styles.transactionContent}>
          <View style={styles.topRow}>
            <Text style={[styles.type, { color: isReceived ? '#388E3C' : '#C62828' }]}>
              {item.type}
            </Text>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          </View>
          <Text style={styles.detail}>
            {isReceived ? `From: ${item.from}` : `To: ${item.to}`}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#f9fafb',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statusIndicator: {
    width: 6,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  transactionContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  type: {
    fontWeight: '700',
    fontSize: 16,
  },
  amount: {
    fontWeight: '700',
    fontSize: 20,
    color: '#333',
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});
