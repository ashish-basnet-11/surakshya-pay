import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  BackHandler,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";

const GeneralSettings = () => {
  const router = useRouter();
    useFocusEffect(
      useCallback(() => {
        const onBackPress = () => {
          router.replace('/(tabs)/settings'); 
          return true;
        };
    
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          onBackPress
        );
    
        return () => backHandler.remove();
      }, [])
    );

  const [darkMode, setDarkMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [useSystemFont, setUseSystemFont] = useState(true);

  const appearanceOptions = [
    {
      id: "darkMode",
      title: "Dark Mode",
      description: "Use dark theme throughout the app",
      icon: "moon",
      iconSet: "Ionicons",
      color: "#5856D6",
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      id: "systemFont",
      title: "Use System Font",
      description: "Match your device's font preferences",
      icon: "format-font",
      iconSet: "MaterialCommunityIcons",
      color: "#34C759",
      value: useSystemFont,
      onToggle: setUseSystemFont,
    },
  ];

  const appOptions = [
    {
      id: "autoUpdate",
      title: "Auto Update",
      description: "Automatically install app updates",
      icon: "refresh-ccw",
      iconSet: "Feather",
      color: "#FF9500",
      value: autoUpdate,
      onToggle: setAutoUpdate,
    },
  ];

  const renderIcon = (iconSet, iconName, size, color) => {
    switch (iconSet) {
      case "Ionicons":
        return <Ionicons name={iconName} size={size} color={color} />;
      case "MaterialCommunityIcons":
        return (
          <MaterialCommunityIcons name={iconName} size={size} color={color} />
        );
      case "Feather":
        return <Feather name={iconName} size={size} color={color} />;
      default:
        return <Ionicons name={iconName} size={size} color={color} />;
    }
  };

  const renderSection = (title, options) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, styles.sectionTextLeftMargin]}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <View
            key={option.id}
            style={[
              styles.optionItem,
              index === options.length - 1 && styles.lastItem,
            ]}
          >
            <View style={styles.optionLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: option.color },
                ]}
              >
                {renderIcon(option.iconSet, option.icon, 22, "#FFFFFF")}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
            </View>
            <Switch
              value={option.value}
              onValueChange={option.onToggle}
              trackColor={{ false: "#E5E5EA", true: option.color + "40" }}
              thumbColor={option.value ? option.color : "#FFFFFF"}
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>General</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <Text style={styles.sectionSubtitle}>
            Customize your app experience and behavior
          </Text>
        </View>
        <View style={styles.sectionSpacing}>
          {renderSection("Appearance", appearanceOptions)}
        </View>

        <View>{renderSection("App Behavior", appOptions)}</View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color="#34C759" />
              <Text style={styles.infoTitle}>App Version</Text>
            </View>
            <Text style={styles.infoText}>Version 2.1.4 • Build 2024.3.15</Text>
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
    backgroundColor: "#F8F9FA",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === "ios" ? 20 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.3,
    paddingLeft: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 22,
  },
  optionsContainer: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  optionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  optionDescription: {
    fontSize: 15,
    color: "#8E8E93",
    lineHeight: 20,
  },
  switch: {
    transform: Platform.OS === "ios" ? [] : [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#6D6D70",
    lineHeight: 22,
  },
  sectionSpacing: {
    marginBottom: 20,
  },
  sectionTextLeftMargin: {
    marginLeft: 20,
  },
});
