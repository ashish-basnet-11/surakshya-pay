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

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          <Text
            style={[
              styles.status,
              isReceived ? styles.statusReceived : styles.statusSent,
            ]}
          >
            {item.type}
          </Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.detail}>
          {isReceived ? `From: ${item.from}` : `To: ${item.to}`}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notifications</Text>
      </View>

      {/* Mark all as read button */}
      <TouchableOpacity style={styles.markAllButton}>
        <Text style={styles.markAllText}>Mark all as read</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
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
  markAllButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    marginTop:10
  },
  markAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
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
  statusReceived: {
    color: '#4caf50',
  },
  statusSent: {
    color: '#ff5722',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  detail: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
});
