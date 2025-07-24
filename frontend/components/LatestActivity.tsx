import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LatestActivityScreen = () => {
  const transactions = [
    {
      id: 1,
      name: 'David',
      date: '19 Nov 2020',
      amount: '+$70.00',
      type: 'received',
      avatar: 'https://i.pravatar.cc/40?img=1'
    },
    {
      id: 2,
      name: 'Angelica',
      date: '19 Nov 2020',
      amount: '$150.00',
      type: 'sent',
      avatar: 'https://i.pravatar.cc/40?img=2'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Latest Activity</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsList}>
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.leftSection}>
              <Image 
                source={{ uri: transaction.avatar }} 
                style={styles.avatar}
              />
              <View style={styles.transactionInfo}>
                <Text style={styles.name}>{transaction.name}</Text>
                <Text style={styles.date}>{transaction.date}</Text>
              </View>
            </View>

            <View style={styles.rightSection}>
              <Text 
                style={[
                  styles.amount,
                  transaction.type === 'received' 
                    ? styles.receivedAmount 
                    : styles.sentAmount
                ]}
              >
                {transaction.amount}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color="#C0C0C0" 
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.bottomIcon}>
          <Ionicons name="person" size={24} color="white" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  viewAllText: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '500',
  },
  transactionsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  receivedAmount: {
    color: '#00D4AA',
  },
  sentAmount: {
    color: '#FF6B6B',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LatestActivityScreen;