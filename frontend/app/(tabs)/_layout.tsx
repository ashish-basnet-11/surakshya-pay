"use client"

import { Tabs, useSegments } from "expo-router"
import { View, TouchableOpacity, StyleSheet, type ViewStyle, Text, Platform } from "react-native"
import { House, ChartPie, WalletMinimal, Settings2, ScanLine } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import Colors from "@/constants/Colors"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"

export default function TabLayout() {
  const segments = useSegments()
  const lastSegment = segments[segments.length - 1]

  const hideOnScreens = [
    "topup",
    "withdraw",
    "details",
    "notification",
    "scan",
    "settings",
    "profile-details",
    "security-settings",
    "about-settings",
    "transaction-settings",
    "general-settings",
    "verifyKyc",
    "editPersonalInfo",
    "sendMoney"
  ]
  const shouldHideTabBar = hideOnScreens.includes(lastSegment)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: shouldHideTabBar
          ? {
              display: "none",
              height: 0,
            }
          : {
              position: "absolute",
              height: Platform.OS === "ios" ? 70 : 65,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              backgroundColor: "transparent",
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
      }}
      tabBar={(props) => (shouldHideTabBar ? null : <PremiumTabBar {...props} />)}
    />
  )
}

export function PremiumTabBar({ state, descriptors, navigation, style }: BottomTabBarProps & { style?: ViewStyle }) {
  const insets = useSafeAreaInsets()

  const routeOrder = ["index", "statistics", "scan", "wallet", "settings"]
  const orderedRoutes = routeOrder
    .map((name) => state.routes.find((route) => route.name === name))
    .filter(Boolean) as typeof state.routes

  const getIcon = (name: string, color: string, size = 22) => {
    switch (name) {
      case "index":
        return <House size={size} color={color} strokeWidth={2.5} />
      case "statistics":
        return <ChartPie size={size} color={color} strokeWidth={2.5} />
      case "scan":
        return <ScanLine size={size} color={color} strokeWidth={2.5} />
      case "wallet":
        return <WalletMinimal size={size} color={color} strokeWidth={2.5} />
      case "settings":
        return <Settings2 size={size} color={color} strokeWidth={2.5} />
      default:
        return null
    }
  }

  const getTabLabel = (name: string) => {
    switch (name) {
      case "index":
        return "Home"
      case "statistics":
        return "Analytics"
      case "scan":
        return "Scan"
      case "wallet":
        return "Wallet"
      case "settings":
        return "Settings"
      default:
        return name
    }
  }

  const tabBarStyle = StyleSheet.flatten([
    styles.tabBarContainer,
    style,
    { paddingBottom: Math.max(insets.bottom, 12) },
  ])

  return (
    <View style={tabBarStyle}>
      {/* Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Tab Items Container */}
      <View style={styles.tabItemsContainer}>
        {orderedRoutes.map((route, index) => {
          const isFocused = state.index === state.routes.findIndex((r) => r.key === route.key)
          const isCenter = route.name === "scan"

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerButtonContainer}>
                <TouchableOpacity onPress={onPress} style={styles.centerButton} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[Colors.secondary, Colors.secondaryLight]}
                    style={styles.centerButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {getIcon(route.name, Colors.textInverse, 24)}
                  </LinearGradient>

                  {/* Floating Ring */}
                  <View style={styles.centerButtonRing} />
                </TouchableOpacity>

                {/* Center Button Label */}
                <Text style={styles.centerButtonLabel}>Scan</Text>
              </View>
            )
          }

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabButton} activeOpacity={0.7}>
              <View style={styles.tabButtonContent}>
                {/* Active Background */}
                {isFocused && (
                  <View style={styles.activeBackground}>
                    <LinearGradient
                      colors={["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.25)"]}
                      style={styles.activeBackgroundGradient}
                    />
                  </View>
                )}

                {/* Icon Container */}
                <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                  {getIcon(route.name, isFocused ? Colors.textInverse : Colors.neutral300, isFocused ? 24 : 22)}
                </View>

                {/* Label */}
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{getTabLabel(route.name)}</Text>

                {/* Active Indicator */}
                {isFocused && (
                  <View style={styles.activeIndicator}>
                    <LinearGradient
                      colors={[Colors.accent, Colors.accentLight]}
                      style={styles.activeIndicatorGradient}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    paddingTop: 0,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  gradientBackground: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItemsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 70,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tabButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
  activeBackgroundGradient: {
    flex: 1,
    borderRadius: 12,
  },
  iconContainer: {
    marginBottom: 3,
    padding: 1,
  },
  iconContainerActive: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.neutral300,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  tabLabelActive: {
    color: Colors.textInverse,
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    width: 20,
    height: 2,
    borderRadius: 1,
    overflow: "hidden",
  },
  activeIndicatorGradient: {
    flex: 1,
    borderRadius: 1,
  },
  centerButtonContainer: {
    alignItems: "center",
    position: "relative",
    top: -16,
  },
  centerButton: {
    position: "relative",
    marginBottom: 6,
  },
  centerButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  centerButtonRing: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 31,
    borderWidth: 1.5,
    borderColor: Colors.accent + "40",
    backgroundColor: "transparent",
  },
  centerButtonLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textInverse,
    letterSpacing: 0.2,
    marginTop: 2,
  },
})
