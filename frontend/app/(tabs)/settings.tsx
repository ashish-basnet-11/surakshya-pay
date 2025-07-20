import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

const Settings = () => {
  const router = useRouter();

  const settingsData = [
    {
      title: 'Profile',
      items: [
        {
          label: 'Personal Information',
          description: 'Manage your personal details and preferences',
          icon: 'person-outline',
          route: '/(tabs)/(settings)/profile-details',
        },
      ],
    },
    {
      title: 'Security & Privacy',
      items: [
        {
          label: 'Security Settings',
          description: 'Password, biometrics, and account security',
          icon: 'shield-checkmark-outline',
          route: '/(tabs)/(settings)/security-settings',
        },
      ],
    },
    {
      title: 'Transactions',
      items: [
        {
          label: 'Transaction Settings',
          description: 'Manage payment methods and transaction limits',
          icon: 'card-outline',
          route: '/(tabs)/(settings)/transaction-settings',
        },
      ],
    },
    {
      title: 'General',
      items: [
        {
          label: 'App Preferences',
          description: 'Notifications, language, and display settings',
          icon: 'settings-outline',
          route: '/(tabs)/(settings)/general-settings',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          label: 'About SurakshyaPay',
          description: 'App version, terms, and privacy policy',
          icon: 'information-circle-outline',
          route: '/(tabs)/(settings)/about-settings',
        },
      ],
    },
  ];

  const renderSettingItem = (item) => (
    <TouchableOpacity
      key={item.label}
      style={styles.settingItem}
      onPress={() => router.push(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={22} color={Colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingLabel}>{item.label}</Text>
          <Text style={styles.settingDescription}>{item.description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
    </TouchableOpacity>
  );

  const renderSection = (section, index) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, itemIndex) => (
          <View key={item.label}>
            {renderSettingItem(item)}
            {itemIndex < section.items.length - 1 && <View style={styles.itemSeparator} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {settingsData.map((section, index) => renderSection(section, index))}
          
          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.primary,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    marginLeft: 4,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 76,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default Settings;