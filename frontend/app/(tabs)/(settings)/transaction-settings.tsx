import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const TransactionSettings = () => {
  const [limitAlerts, setLimitAlerts] = useState(true);
  const [autoCategorize, setAutoCategorize] = useState(false);
  const [transactionNotifications, setTransactionNotifications] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="credit-card" size={26} color="#fff" />
        <Text style={styles.headerText}>Transaction Settings</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Transaction Notifications</Text>
          <Switch
            value={transactionNotifications}
            onValueChange={setTransactionNotifications}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Spending Limit Alerts</Text>
          <Switch
            value={limitAlerts}
            onValueChange={setLimitAlerts}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Auto Categorize Transactions</Text>
          <Switch
            value={autoCategorize}
            onValueChange={setAutoCategorize}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default TransactionSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});
