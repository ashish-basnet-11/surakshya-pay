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

const SecuritySettings = () => {
  const router = useRouter();

  const [isFaceIDEnabled, setIsFaceIDEnabled] = useState(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Security Settings</Text>
      </View>

      <View style={[styles.item, { borderBottomWidth: 1 }]}>
        <View style={[styles.iconWrapper, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="finger-print" size={24} color="#fff" />
        </View>
        <Text style={styles.itemText}>Enable Face ID / Fingerprint</Text>
        <Switch
          value={isFaceIDEnabled}
          onValueChange={setIsFaceIDEnabled}
          trackColor={{ false: '#ccc', true: Colors.primary }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
      </View>

      <View style={[styles.item, { borderBottomWidth: 1 }]}>
        <View style={[styles.iconWrapper, { backgroundColor: '#2196F3' }]}>
          <MaterialIcons name="security" size={24} color="#fff" />
        </View>
        <Text style={styles.itemText}>Two-Factor Authentication</Text>
        <Switch
          value={isTwoFactorEnabled}
          onValueChange={setIsTwoFactorEnabled}
          trackColor={{ false: '#ccc', true: Colors.primary }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
      </View>

      <View style={[styles.item, { borderBottomWidth: 0 }]}>
        <View style={[styles.iconWrapper, { backgroundColor: '#FF9800' }]}>
          <Feather name="bell" size={24} color="#fff" />
        </View>
        <Text style={styles.itemText}>Security Alerts</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={setIsNotificationsEnabled}
          trackColor={{ false: '#ccc', true: Colors.primary }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
      </View>
    </ScrollView>
  );
};

export default SecuritySettings;

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
    marginBottom: 10,
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
    elevation: 1,
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
