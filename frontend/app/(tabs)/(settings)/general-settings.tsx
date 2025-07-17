import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

const GeneralSettings = () => {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [useSystemFont, setUseSystemFont] = useState(true);

  const goBackToSettings = () => {
    router.push('/settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackToSettings} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>General Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        {/* Dark Mode */}
        <View style={[styles.item, { borderBottomWidth: 1 }]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#6C63FF' }]}>
            <Ionicons name="moon" size={24} color="#fff" />
          </View>
          <Text style={styles.itemText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        {/* Auto Update */}
        <View style={[styles.item, { borderBottomWidth: 1 }]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FF9800' }]}>
            <Feather name="refresh-ccw" size={24} color="#fff" />
          </View>
          <Text style={styles.itemText}>Auto Update</Text>
          <Switch
            value={autoUpdate}
            onValueChange={setAutoUpdate}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        {/* Use System Font */}
        <View style={[styles.item, { borderBottomWidth: 0 }]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#4CAF50' }]}>
            <MaterialCommunityIcons name="format-font" size={24} color="#fff" />
          </View>
          <Text style={styles.itemText}>Use System Font</Text>
          <Switch
            value={useSystemFont}
            onValueChange={setUseSystemFont}
            trackColor={{ false: '#ccc', true: Colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GeneralSettings;

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
  scrollView: {
    flex: 1,
    marginTop:10,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
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
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});
