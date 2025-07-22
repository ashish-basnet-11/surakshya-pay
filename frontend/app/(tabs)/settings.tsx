"use client";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Switch,
  Alert,
  Share,
  FlatList,
  TextInput,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";

const Settings = () => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
 
    useEffect(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          router.replace('/(tabs)');
          return true;
        }
      );
  
      return () => backHandler.remove();
    }, [router]);

  const userInfo = {
    name: "Eleanor Pena",
    email: "eleanor.pena@email.com",
    membershipTier: "Premium",
    joinDate: "Member since July 2024",
    avatar: "EP",
  };

  const quickToggles = [
    {
      id: "darkMode",
      title: "Dark Mode",
      description: "Switch to dark theme",
      icon: "moon",
      value: darkMode,
      onToggle: setDarkMode,
      color: Colors.secondary,
    },
    {
      id: "notifications",
      title: "Push Notifications",
      description: "Receive transaction alerts",
      icon: "notifications",
      value: notifications,
      onToggle: setNotifications,
      color: Colors.info,
    },
    {
      id: "biometrics",
      title: "Biometric Login",
      description: "Use fingerprint or Face ID",
      icon: "finger-print",
      value: biometrics,
      onToggle: setBiometrics,
      color: Colors.success,
    },
    {
      id: "autoBackup",
      title: "Auto Backup",
      description: "Backup data automatically",
      icon: "cloud-upload",
      value: autoBackup,
      onToggle: setAutoBackup,
      color: Colors.warning,
    },
  ];

  const settingsData = [
    {
      title: "Account & Profile",
      items: [
        {
          label: "Personal Information",
          description: "Manage your personal details",
          icon: "person-outline",
          iconColor: Colors.secondary,
          iconBg: Colors.secondary + "15",
          route: "/(tabs)/(settings)/profile-details",
          badge: null,
        },
        {
          label: "Payment Methods",
          description: "Cards, banks, and payment options",
          icon: "card-outline",
          iconColor: Colors.success,
          iconBg: Colors.success + "15",
          route: "/(tabs)/(settings)/transaction-settings",
          badge: "2 Cards",
        },
        {
          label: "Transaction Limits",
          description: "Set spending and transfer limits",
          icon: "speedometer-outline",
          iconColor: Colors.warning,
          iconBg: Colors.warning + "15",
          route: "/(tabs)/(settings)/transaction-settings",
          badge: null,
        },
      ],
    },
    {
      title: "Security & Privacy",
      items: [
        {
          label: "Security Settings",
          description: "Password, 2FA, and login security",
          icon: "shield-checkmark-outline",
          iconColor: Colors.error,
          iconBg: Colors.error + "15",
          route: "/(tabs)/(settings)/security-settings",
          badge: "Strong",
        },
        {
          label: "Privacy Controls",
          description: "Data sharing and privacy options",
          icon: "eye-off-outline",
          iconColor: Colors.info,
          iconBg: Colors.info + "15",
          route: "/(tabs)/(settings)/security-settings",
          badge: null,
        },
        {
          label: "Login Activity",
          description: "Recent logins and device history",
          icon: "time-outline",
          iconColor: Colors.secondary,
          iconBg: Colors.secondary + "15",
          route: "/(tabs)/(settings)/security-settings",
          badge: "3 devices",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          label: "App Preferences",
          description: "Language, currency, and display",
          icon: "settings-outline",
          iconColor: Colors.primary,
          iconBg: Colors.primary + "15",
          route: "/(tabs)/(settings)/general-settings",
          badge: null,
        },
        {
          label: "Notification Settings",
          description: "Customize alerts and reminders",
          icon: "notifications-outline",
          iconColor: Colors.info,
          iconBg: Colors.info + "15",
          route: "/(tabs)/(settings)/general-settings",
          badge: null,
        },
        {
          label: "Transaction Categories",
          description: "Organize your spending categories",
          icon: "pricetags-outline",
          iconColor: Colors.success,
          iconBg: Colors.success + "15",
          route: "/(tabs)/(settings)/transaction-settings",
          badge: "12 categories",
        },
      ],
    },
    {
      title: "Support & Information",
      items: [
        {
          label: "Help Center",
          description: "FAQs and support articles",
          icon: "help-circle-outline",
          iconColor: Colors.info,
          iconBg: Colors.info + "15",
          route: "/(tabs)/(settings)/about-settings",
          badge: null,
        },
        {
          label: "Contact Support",
          description: "Get help from our team",
          icon: "chatbubble-outline",
          iconColor: Colors.success,
          iconBg: Colors.success + "15",
          route: "/(tabs)/(settings)/about-settings",
          badge: "24/7",
        },
        {
          label: "App Information",
          description: "Version, terms, and privacy policy",
          icon: "information-circle-outline",
          iconColor: Colors.warning,
          iconBg: Colors.warning + "15",
          route: "/(tabs)/(settings)/about-settings",
          badge: "v2.1.0",
        },
      ],
    },
  ];

  const quickActions = [
    {
      title: "Share App",
      icon: "share-outline",
      color: Colors.secondary,
      action: () => handleShareApp(),
    },
    {
      title: "Rate App",
      icon: "star-outline",
      color: Colors.warning,
      action: () => handleRateApp(),
    },
    {
      title: "Backup Data",
      icon: "cloud-download-outline",
      color: Colors.info,
      action: () => handleBackupData(),
    },
    {
      title: "Export Data",
      icon: "download-outline",
      color: Colors.success,
      action: () => handleExportData(),
    },
  ];

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: "Check out SurakshyaPay - the most secure digital wallet app!",
        url: "https://surakshyapay.com",
      });
    } catch (error) {
      console.error("Error sharing app:", error);
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      "Rate SurakshyaPay",
      "Would you like to rate our app on the App Store?",
      [
        { text: "Later", style: "cancel" },
        { text: "Rate Now", onPress: () => console.log("Opening app store") },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      "Backup Data",
      "Your data will be securely backed up to the cloud.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Backup", onPress: () => console.log("Starting backup") },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Export your transaction data as a CSV file.", [
      { text: "Cancel", style: "cancel" },
      { text: "Export", onPress: () => console.log("Exporting data") },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => router.push("/login"),
        },
      ]
    );
  };

  const renderSettingItem = (item: (typeof settingsData)[0]["items"][0]) => (
    <TouchableOpacity
      key={item.label}
      style={styles.settingItem}
      onPress={() => router.push(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.settingDescription}>{item.description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.neutral400} />
    </TouchableOpacity>
  );

  const renderSection = (section: (typeof settingsData)[0], index: number) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, itemIndex) => (
          <View key={item.label}>
            {renderSettingItem(item)}
            {itemIndex < section.items.length - 1 && (
              <View style={styles.itemSeparator} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        {/* Background Gradient */}
        <LinearGradient
          colors={[
            Colors.primary,
            Colors.primaryLight,
            Colors.backgroundSecondary,
          ]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            {showSearch ? (
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search settings..."
                  placeholderTextColor={Colors.neutral300}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
                <TouchableOpacity
                  onPress={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                  style={styles.searchCloseButton}
                >
                  <Ionicons name="close" size={24} color={Colors.textInverse} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <BlurView
                    intensity={20}
                    tint="light"
                    style={styles.backButtonBlur}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={Colors.textInverse}
                    />
                  </BlurView>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <TouchableOpacity
                  style={styles.headerAction}
                  activeOpacity={0.7}
                  onPress={() => setShowSearch(true)}
                >
                  <BlurView
                    intensity={20}
                    tint="light"
                    style={styles.headerActionBlur}
                  >
                    <Ionicons
                      name="search-outline"
                      size={20}
                      color={Colors.textInverse}
                    />
                  </BlurView>
                </TouchableOpacity>
              </>
            )}
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Profile Card */}
            <View style={styles.profileSection}>
              <View style={styles.profileCard}>
                <LinearGradient
                  colors={[Colors.secondary, Colors.secondaryLight]}
                  style={styles.profileGradient}
                >
                  <View style={styles.profileContent}>
                    <View style={styles.profileLeft}>
                      <View style={styles.avatarContainer}>
                        <LinearGradient
                          colors={[Colors.accent, Colors.accentLight]}
                          style={styles.avatarGradient}
                        >
                          <Text style={styles.avatarText}>
                            {userInfo.avatar}
                          </Text>
                        </LinearGradient>
                        <View style={styles.onlineIndicator} />
                      </View>
                      <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{userInfo.name}</Text>
                        <Text style={styles.profileEmail}>
                          {userInfo.email}
                        </Text>
                        <View style={styles.membershipContainer}>
                          <View style={styles.membershipBadge}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.membershipText}>
                              {userInfo.membershipTier}
                            </Text>
                          </View>
                          <Text style={styles.joinDate}>
                            {userInfo.joinDate}
                          </Text>
                        </View>
                        <View style={styles.kycContainer}>
                          <TouchableOpacity
                            style={styles.kycContainer}
                            onPress={() =>
                              router.push("/(tabs)/(settings)/verifyKyc")
                            }
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="shield-checkmark-outline"
                              size={14}
                              color={Colors.success}
                            />
                            <Text style={styles.kycText}>Verify KYC</Text>
                            <Ionicons
                              name="chevron-forward"
                              size={14}
                              color={Colors.neutral300}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.editProfileButton}
                      onPress={() =>
                        router.push("/(tabs)/(settings)/profile-details")
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={Colors.textInverse}
                      />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Quick Toggles */}
            <View style={styles.quickTogglesSection}>
              <Text style={styles.sectionTitle}>Quick Settings</Text>
              <View style={styles.quickTogglesContainer}>
                <FlatList
                  data={quickToggles}
                  numColumns={2}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item: toggle, index }) => (
                    <View
                      key={toggle.id}
                      style={[
                        styles.quickToggleItem,
                        index % 2 === 1 && styles.quickToggleItemRight,
                      ]}
                    >
                      <View style={styles.quickToggleContent}>
                        <View
                          style={[
                            styles.quickToggleIcon,
                            { backgroundColor: toggle.color + "15" },
                          ]}
                        >
                          <Ionicons
                            name={toggle.icon as any}
                            size={20}
                            color={toggle.color}
                          />
                        </View>
                        <View style={styles.quickToggleInfo}>
                          <Text style={styles.quickToggleTitle}>
                            {toggle.title}
                          </Text>
                          <Text style={styles.quickToggleDescription}>
                            {toggle.description}
                          </Text>
                        </View>
                        <Switch
                          value={toggle.value}
                          onValueChange={toggle.onToggle}
                          trackColor={{
                            false: Colors.neutral300,
                            true: toggle.color + "40",
                          }}
                          thumbColor={
                            toggle.value ? toggle.color : Colors.background
                          }
                          style={styles.switch}
                        />
                      </View>
                    </View>
                  )}
                  contentContainerStyle={styles.quickTogglesContainer}
                  columnWrapperStyle={{
                    justifyContent: "space-between",
                  }}
                />
              </View>
            </View>

            {/* Settings Sections */}
            {settingsData.map((section, index) =>
              renderSection(section, index)
            )}

            {/* App Info */}
            <View style={styles.appInfoSection}>
              <View style={styles.appInfoCard}>
                <View style={styles.appInfoContent}>
                  <View style={styles.appInfoLeft}>
                    <View style={styles.appIcon}>
                      <LinearGradient
                        colors={[Colors.secondary, Colors.secondaryLight]}
                        style={styles.appIconGradient}
                      >
                        <Ionicons
                          name="shield-checkmark"
                          size={24}
                          color={Colors.textInverse}
                        />
                      </LinearGradient>
                    </View>
                    <View style={styles.appInfoText}>
                      <Text style={styles.appName}>SurakshyaPay</Text>
                      <Text style={styles.appVersion}>
                        Version 2.1.0 (Build 241)
                      </Text>
                      <Text style={styles.appDescription}>
                        Secure Digital Payments
                      </Text>
                    </View>
                  </View>
                  <View style={styles.securityBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color={Colors.success}
                    />
                    <Text style={styles.securityText}>Verified</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutSection}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[Colors.error, "#FF6B6B"]}
                  style={styles.logoutGradient}
                >
                  <View style={styles.logoutContent}>
                    <Ionicons
                      name="log-out-outline"
                      size={22}
                      color={Colors.textInverse}
                    />
                    <Text style={styles.logoutText}>Sign Out</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textInverse,
    letterSpacing: -0.3,
  },
  headerAction: {
    borderRadius: 25,
    overflow: "hidden",
  },
  headerActionBlur: {
    width: 44,
    height: 44,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: Colors.textInverse,
    fontSize: 16,
    paddingVertical: 8,
  },
  searchCloseButton: {
    marginLeft: 8,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileSection: {
    marginBottom: 32,
  },
  profileCard: {
    borderRadius: 20,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  profileGradient: {
    borderRadius: 20,
    padding: 24,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.textInverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textInverse,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.neutral200,
    marginBottom: 8,
    fontWeight: "500",
  },
  membershipContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 12,
  },
  membershipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFD700",
    marginLeft: 4,
  },
  joinDate: {
    fontSize: 11,
    color: Colors.neutral300,
    fontWeight: "500",
  },
  kycContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  kycText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "500",
    marginRight: 4,
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickTogglesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textInverse,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  quickTogglesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickToggleItem: {
    width: "48%",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickToggleItemRight: {
    marginLeft: "4%",
  },
  quickToggleContent: {
    alignItems: "center",
  },
  quickToggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickToggleInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  quickToggleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
    textAlign: "center",
  },
  quickToggleDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 14,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  section: {
    marginBottom: 24,
  },
  sectionContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
    letterSpacing: -0.1,
  },
  badge: {
    backgroundColor: Colors.secondary + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.secondary,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontWeight: "500",
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 80,
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionItem: {
    width: "23%",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 14,
  },
  appInfoSection: {
    marginBottom: 24,
  },
  appInfoCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  appInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appIcon: {
    marginRight: 16,
  },
  appIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  appInfoText: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  appVersion: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
    fontWeight: "500",
  },
  appDescription: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: "500",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.success,
    marginLeft: 4,
  },
  logoutSection: {
    marginBottom: 24,
  },
  logoutButton: {
    borderRadius: 16,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default Settings;