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

const SecuritySettings = () => {
  const [isFaceIDEnabled, setIsFaceIDEnabled] = useState(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="lock" size={26} color="#fff" />
        <Text style={styles.headerText}>Security Settings</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Enable Face ID / Fingerprint</Text>
          <Switch
            value={isFaceIDEnabled}
            onValueChange={setIsFaceIDEnabled}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Two-Factor Authentication</Text>
          <Switch
            value={isTwoFactorEnabled}
            onValueChange={setIsTwoFactorEnabled}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Security Alerts</Text>
          <Switch
            value={isNotificationsEnabled}
            onValueChange={setIsNotificationsEnabled}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default SecuritySettings;

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
