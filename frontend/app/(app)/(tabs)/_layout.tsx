import { Tabs } from "expo-router";
import { BottomTabBar, SideBar } from "@/components/navigation/AppTabBar";
import { useBreakpoint, useTheme } from "@/theme";

export default function TabsLayout() {
  const t = useTheme();
  const { isDesktop } = useBreakpoint();
  return (
    <Tabs
      tabBar={(props) => (isDesktop ? <SideBar {...props} /> : <BottomTabBar {...props} />)}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isDesktop ? "left" : "bottom",
        sceneStyle: { backgroundColor: t.colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="budgets" options={{ title: "Budgets" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
