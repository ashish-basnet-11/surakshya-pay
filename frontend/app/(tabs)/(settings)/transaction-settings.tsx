import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'; 
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

const TransactionSettings = () => {
  const router = useRouter();

  const [limitAlerts, setLimitAlerts] = useState(true);
  const [autoCategorize, setAutoCategorize] = useState(false);
  const [transactionNotifications, setTransactionNotifications] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerText}>Transaction Settings</Text>
      </View>

      <View style={[styles.item, { borderBottomWidth: 1 }]}>
        <View style={[styles.iconWrapper, { backgroundColor: '#2196F3' }]}>
          <Ionicons name="notifications" size={24} color="#fff" />
        </View>
        <Text style={styles.itemText}>Transaction Notifications</Text>
        <Switch
          value={transactionNotifications}
          onValueChange={setTransactionNotifications}
          trackColor={{ false: '#ccc', true: Colors.primary }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
      </View>

      <View style={[styles.item, { borderBottomWidth: 1 }]}>
        <View style={[styles.iconWrapper, { backgroundColor: '#F44336' }]}>
          <MaterialIcons name="notifications-active" size={24} color="#fff" />
        </View>
        <Text style={styles.itemText}>Spending Limit Alerts</Text>
        <Switch
          value={limitAlerts}
          onValueChange={setLimitAlerts}
          trackColor={{ false: '#ccc', true: Colors.primary }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
      </View>

      <View style={[styles.item, { borderBottomWidth: 0 }]}>
        <View style={[styles.iconWrapper, { backgroundColor: '#4CAF50' }]}>
          <Feather name="tag" size={24} color="#fff" />
        </View>
        <Text style={styles.itemText}>Auto Categorize Transactions</Text>
        <Switch
          value={autoCategorize}
          onValueChange={setAutoCategorize}
          trackColor={{ false: '#ccc', true: Colors.primary }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
      </View>
    </ScrollView>
  );
};

export default TransactionSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',  
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',  
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 15,  
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerText: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderRadius: 12,
    marginVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',  
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
  },
});
