import { Tabs, useRouter } from "expo-router";
import { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMe } from "@/apis/user";
import { BrandMark } from "@/components/auth/AuthShell";
import { Avatar, Button, dialog, Icon, IconName, InteractionState, Text } from "@/components/ui";
import { signOut } from "@/lib/api";
import { makeStyles, useTheme } from "@/theme";

export type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export const tabs: { name: string; label: string; icon: IconName; activeIcon: IconName }[] = [
  { name: "index", label: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "analytics", label: "Analytics", icon: "pie-chart-outline", activeIcon: "pie-chart" },
  { name: "budgets", label: "Budgets", icon: "wallet-outline", activeIcon: "wallet" },
  { name: "account", label: "Account", icon: "person-circle-outline", activeIcon: "person-circle" },
];

function useTabNavigation({ state, navigation }: TabBarProps) {
  const activeName = state.routes[state.index]?.name;
  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented && activeName !== name) navigation.navigate(name);
  };
  return { activeName, go };
}

export function BottomTabBar(props: TabBarProps) {
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const { activeName, go } = useTabNavigation(props);

  return (
    <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const active = tab.name === activeName;
        return (
          <Pressable
            key={tab.name}
            onPress={() => go(tab.name)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={(state) => [s.bottomItem, (state as InteractionState).focused && s.focused]}
          >
            <View style={[s.bottomIcon, active && s.bottomIconActive]}>
              <Icon name={active ? tab.activeIcon : tab.icon} size={22} tone={active ? "primary" : "muted"} />
            </View>
            <Text variant="caption" tone={active ? "primary" : "muted"} weight={active ? "600" : "500"}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SideBar(props: TabBarProps) {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeName, go } = useTabNavigation(props);
  const { data: me } = useMe();

  const confirmSignOut = async () => {
    if (await dialog.confirm({ title: "Sign out?", message: "You'll need your password to sign back in.", confirmLabel: "Sign out", icon: "log-out-outline" })) signOut();
  };

  return (
    <View style={[s.sidebar, { paddingTop: insets.top + t.space.xl }]}>
      <View style={s.sidebarBrand}>
        <BrandMark />
      </View>
      <Button title="Send money" icon="paper-plane-outline" fullWidth onPress={() => router.push("/send")} />
      <View style={s.navList} accessibilityRole="tablist">
        {tabs.map((tab) => {
          const active = tab.name === activeName;
          return (
            <Pressable
              key={tab.name}
              onPress={() => go(tab.name)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={(state) => {
                const { hovered, focused } = state as InteractionState;
                return [s.navItem, active && s.navItemActive, !active && hovered && s.navItemHover, focused && s.focused];
              }}
            >
              <Icon name={active ? tab.activeIcon : tab.icon} size={20} tone={active ? "primary" : "muted"} />
              <Text variant="bodyStrong" tone={active ? "primary" : "muted"}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={s.sidebarFooter}>
        <Pressable
          onPress={() => go("account")}
          accessibilityRole="button"
          accessibilityLabel="Open account"
          style={(state) => [s.userCard, (state as InteractionState).hovered && s.navItemHover]}
        >
          <Avatar name={me?.full_name} seed={me?.username} size={36} />
          <View style={s.userText}>
            <Text variant="smallStrong" numberOfLines={1}>
              {me?.full_name || "Your account"}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {me?.email}
            </Text>
          </View>
        </Pressable>
        <Button title="Sign out" icon="log-out-outline" variant="ghost" size="sm" onPress={confirmSignOut} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  bottomBar: {
    flexDirection: "row",
    backgroundColor: t.colors.surface,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    paddingTop: 6,
  },
  bottomItem: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 2, cursor: "pointer" },
  bottomIcon: { width: 56, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  bottomIconActive: { backgroundColor: t.colors.primarySoft },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid", borderRadius: t.radius.sm },
  sidebar: {
    width: 260,
    height: "100%",
    backgroundColor: t.colors.surface,
    borderRightWidth: 1,
    borderRightColor: t.colors.border,
    paddingHorizontal: t.space.lg,
    paddingBottom: t.space.xl,
    gap: t.space.xl,
  },
  sidebarBrand: { paddingHorizontal: t.space.xs },
  navList: { gap: 2 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.md,
    height: 44,
    paddingHorizontal: t.space.md,
    borderRadius: t.radius.md,
    cursor: "pointer",
  },
  navItemActive: { backgroundColor: t.colors.primarySoft },
  navItemHover: { backgroundColor: t.colors.surfaceHover },
  sidebarFooter: { marginTop: "auto", gap: t.space.sm, borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: t.space.lg },
  userCard: { flexDirection: "row", alignItems: "center", gap: t.space.md, padding: t.space.sm, borderRadius: t.radius.md, cursor: "pointer" },
  userText: { flex: 1, minWidth: 0 },
}));
