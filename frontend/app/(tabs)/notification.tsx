import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const transactions = [
  {
    id: '1',
    type: 'Received',
    amount: 50,
    from: 'John',
    time: '2 mins ago',
    title: 'Payment Received',
    message: 'You received $50 from John.',
  },
  {
    id: '2',
    type: 'Sent',
    amount: 20,
    to: 'Alice',
    time: '1 hour ago',
    title: 'Payment Sent',
    message: 'You sent $20 to Alice.',
  },
  {
    id: '3',
    type: 'Received',
    amount: 100,
    from: 'Bank',
    time: 'Yesterday',
    title: 'Salary Credited',
    message: 'Your salary of $100 was credited by Bank.',
  },
  {
    id: '4',
    type: 'Sent',
    amount: 10,
    to: 'Bob',
    time: '2 days ago',
    title: 'Payment Sent',
    message: 'You sent $10 to Bob.',
  },
  {
    id: '5',
    type: 'Received',
    amount: 30,
    from: 'Emma',
    time: '3 days ago',
    title: 'Refund Received',
    message: 'You received a refund of $30 from Emma.',
  },
  {
    id: '6',
    type: 'Sent',
    amount: 75,
    to: 'Mark',
    time: '5 days ago',
    title: 'Payment Sent',
    message: 'You sent $75 to Mark.',
  },
  {
    id: '7',
    type: 'Received',
    amount: 200,
    from: 'Company XYZ',
    time: '1 week ago',
    title: 'Bonus Credited',
    message: 'Your bonus of $200 was credited by Company XYZ.',
  },
  {
    id: '8',
    type: 'Sent',
    amount: 15,
    to: 'Lucy',
    time: '1 week ago',
    title: 'Payment Sent',
    message: 'You sent $15 to Lucy.',
  },
  {
    id: '9',
    type: 'Received',
    amount: 120,
    from: 'Alice',
    time: '2 weeks ago',
    title: 'Payment Received',
    message: 'You received $120 from Alice.',
  },
  {
    id: '10',
    type: 'Sent',
    amount: 50,
    to: 'John',
    time: '2 weeks ago',
    title: 'Payment Sent',
    message: 'You sent $50 to John.',
  },
];

const Notification = () => {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof transactions[0] }) => {
    const isReceived = item.type === 'Received';
    const iconName = isReceived ? 'arrow-down-circle' : 'arrow-up-circle';
    const iconColor = isReceived ? '#4CAF50' : '#F44336';

    return (
      <View style={styles.transactionCard}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: iconColor },
          ]}
        />
        <View style={styles.transactionContent}>
          <View style={styles.topRow}>
            <Text style={[styles.type, { color: isReceived ? '#388E3C' : '#C62828' }]}>
              {item.type}
            </Text>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.detail}>
            {isReceived ? `From: ${item.from}` : `To: ${item.to}`}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        {/* Colorful icon at bottom right */}
        <Ionicons
          name={iconName}
          size={28}
          color={iconColor}
          style={styles.bottomRightIcon}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.plainBackButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
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
  plainBackButton: {
    padding: 4,
    marginRight: 10,
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
    position: 'relative', 
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
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
  bottomRightIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});
