import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const GeneralSettings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [useSystemFont, setUseSystemFont] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={26} color="#fff" />
        <Text style={styles.headerText}>General Settings</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Auto Update</Text>
          <Switch
            value={autoUpdate}
            onValueChange={setAutoUpdate}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Use System Font</Text>
          <Switch
            value={useSystemFont}
            onValueChange={setUseSystemFont}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default GeneralSettings;

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
