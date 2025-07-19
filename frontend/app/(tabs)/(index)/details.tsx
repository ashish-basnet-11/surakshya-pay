import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import Colors from '@/constants/Colors';

const Details = () => {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    const parent = navigation.getParent();

    if (parent) {
      parent.setOptions({ tabBarContainerStyle: { display: 'none' } });
    }

    return () => {
      if (parent) {
        parent.setOptions({ tabBarContainerStyle: undefined });
      }
    };
  }, [navigation]);

  const transaction = {
    id: 'TXN12345678',
    type: 'Received',
    amount: 250,
    from: 'John Doe',
    date: 'July 18, 2025',
    time: '10:24 AM',
    status: 'Completed',
    note: 'Thanks for your help!',
  };

  const rows = [
    { label: 'Type', value: transaction.type, icon: 'swap-horizontal', iconColor: '#4caf50' },
    { label: 'Amount', value: `$${transaction.amount}`, icon: 'cash', iconColor: '#2196f3' },
    { label: 'From', value: transaction.from, icon: 'person', iconColor: '#ff9800' },
    { label: 'Date', value: transaction.date, icon: 'calendar', iconColor: '#9c27b0' },
    { label: 'Time', value: transaction.time, icon: 'time', iconColor: '#3f51b5' },
    { label: 'Status', value: transaction.status, icon: 'checkmark-circle', iconColor: '#4caf50' },
    { label: 'Note', value: transaction.note, icon: 'chatbubble-ellipses', iconColor: '#00bcd4' },
    { label: 'Transaction ID', value: transaction.id, icon: 'finger-print', iconColor: '#607d8b' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Transaction Details</Text>
      </View>

      <View style={styles.card}>
        {rows.map((row, index) => (
          <DetailRow
            key={index}
            label={row.label}
            value={row.value}
            icon={row.icon as keyof typeof Ionicons.glyphMap}
            iconColor={row.iconColor}
            isLast={index === rows.length - 1}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const DetailRow = ({
  label,
  value,
  icon,
  iconColor,
  isLast,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  isLast?: boolean;
}) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <View style={styles.textContent}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
    <Ionicons name={icon} size={24} color={iconColor} style={styles.rightIcon} />
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  textContent: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111',
    marginTop: 2,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
