import { Tabs } from "expo-router";
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import {
  House,
  ChartPie,
  WalletMinimal,
  Settings2,
  ScanLine,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarStyle: {
          position: "absolute",
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "white",
          elevation: 10,
          borderTopWidth: 0,
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    />
  );
}

function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): JSX.Element {
  const insets = useSafeAreaInsets();

  const routeOrder = ["index", "statistics", "scan", "wallet", "settings"];
  const orderedRoutes = routeOrder
    .map((name) => state.routes.find((route) => route.name === name))
    .filter(Boolean) as typeof state.routes;

  const getIcon = (name: string, color: string) => {
    switch (name) {
      case "index":
        return <House size={24} color={color} />;
      case "statistics":
        return <ChartPie size={24} color={color} />;
      case "scan":
        return <ScanLine size={24} color={color} />;
      case "wallet":
        return <WalletMinimal size={24} color={color} />;
      case "settings":
        return <Settings2 size={24} color={color} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      {orderedRoutes.map((route) => {
        const isFocused =
          state.index === state.routes.findIndex((r) => r.key === route.key);
        const onPress = () => navigation.navigate(route.name);

        if (route.name === "scan") {
          return (
            <View key={route.key} style={styles.centerButtonWrapper}>
              <TouchableOpacity onPress={onPress} style={styles.centerButton}>
                <ScanLine size={28} color="white" />
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            <View style={styles.iconWrapper}>
              {isFocused ? (
                <View style={styles.focusedIconBackground}>
                  {getIcon(route.name, "white")}
                </View>
              ) : (
                getIcon(route.name, "#888")
              )}

              {isFocused && <View style={styles.underline} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

type Styles = {
  tabBarContainer: ViewStyle;
  tabButton: ViewStyle;
  centerButtonWrapper: ViewStyle;
  centerButton: ViewStyle;
  iconWrapper: ViewStyle;
  underline: ViewStyle;
  focusedIconBackground: ViewStyle;
};

const styles = StyleSheet.create<Styles>({
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
    backgroundColor: "white",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButtonWrapper: {
    position: "relative",
    top: -5,
    width: 70,
    alignItems: "center",
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop:50,
  },
  focusedIconBackground: {
    backgroundColor: Colors.secondary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  underline: {
    width: 20,
    height: 2,
    backgroundColor: Colors.secondary,
    borderRadius: 1,
    marginTop: 4,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 5,
  },
});
