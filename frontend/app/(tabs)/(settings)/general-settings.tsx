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

  const appearanceOptions = [
    {
      id: 'darkMode',
      title: 'Dark Mode',
      description: 'Use dark theme throughout the app',
      icon: 'moon',
      iconSet: 'Ionicons',
      color: '#5856D6',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      id: 'systemFont',
      title: 'Use System Font',
      description: 'Match your device\'s font preferences',
      icon: 'format-font',
      iconSet: 'MaterialCommunityIcons',
      color: '#34C759',
      value: useSystemFont,
      onToggle: setUseSystemFont,
    },
  ];

  const appOptions = [
    {
      id: 'autoUpdate',
      title: 'Auto Update',
      description: 'Automatically install app updates',
      icon: 'refresh-ccw',
      iconSet: 'Feather',
      color: '#FF9500',
      value: autoUpdate,
      onToggle: setAutoUpdate,
    },
  ];

  const renderIcon = (iconSet, iconName, size, color) => {
    switch (iconSet) {
      case 'Ionicons':
        return <Ionicons name={iconName} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      case 'Feather':
        return <Feather name={iconName} size={size} color={color} />;
      default:
        return <Ionicons name={iconName} size={size} color={color} />;
    }
  };

  const renderSection = (title, options) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <View 
            key={option.id} 
            style={[
              styles.optionItem,
              index === options.length - 1 && styles.lastItem
            ]}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                {renderIcon(option.iconSet, option.icon, 22, '#FFFFFF')}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </View>
            <Switch
              value={option.value}
              onValueChange={option.onToggle}
              trackColor={{ 
                false: '#E5E5EA', 
                true: option.color + '40' 
              }}
              thumbColor={option.value ? option.color : '#FFFFFF'}
              ios_backgroundColor="#E5E5EA"
              style={styles.switch}
            />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/settings')} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>General</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.mainTitle}>App Preferences</Text>
          <Text style={styles.mainSubtitle}>
            Customize your app experience and behavior
          </Text>
        </View>

        {/* Appearance Section */}
        {renderSection('Appearance', appearanceOptions)}

        {/* App Behavior Section */}
        {renderSection('App Behavior', appOptions)}

        {/* Language & Region Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language & Region</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#007AFF' }]}>
                  <Ionicons name="language" size={22} color="#FFFFFF" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>Language</Text>
                  <Text style={styles.optionDescription}>English (US)</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionItem, styles.lastItem]} 
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF3B30' }]}>
                  <Ionicons name="location" size={22} color="#FFFFFF" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>Region</Text>
                  <Text style={styles.optionDescription}>United States</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Storage & Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Data</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#AF52DE' }]}>
                  <Ionicons name="cloud-download" size={22} color="#FFFFFF" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>Data Usage</Text>
                  <Text style={styles.optionDescription}>Manage app data consumption</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionItem, styles.lastItem]} 
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF9500' }]}>
                  <Ionicons name="trash" size={22} color="#FFFFFF" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>Clear Cache</Text>
                  <Text style={styles.optionDescription}>Free up storage space</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color="#34C759" />
              <Text style={styles.infoTitle}>App Version</Text>
            </View>
            <Text style={styles.infoText}>
              Version 2.1.4 • Build 2024.3.15
            </Text>
            <Text style={styles.infoSubtext}>
              You're running the latest version of the app.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GeneralSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainHeader: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    marginHorizontal: 20,
    letterSpacing: -0.2,
  },
  optionsContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  optionDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  switch: {
    transform: Platform.OS === 'ios' ? [] : [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6D6D70',
    lineHeight: 20,
  },
});
