import { Tabs, useRouter } from "expo-router";
import { ComponentProps } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
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

// Geometry of the scan dock: a raised button sitting in a notch cut into the bar's top edge.
const BAR_HEIGHT = 60;
const SCAN_SIZE = 58;
const SCAN_LIFT = 22; // how far the button rises above the bar
const NOTCH_GAP = 7; // breathing room between button and notch
const FILLET = 14; // softness of the notch shoulders

/** SVG path for the bar's top edge with a smooth notch centred at width / 2. */
export function notchPath(width: number, height: number, closed = true) {
  const cx = width / 2;
  const r = SCAN_SIZE / 2 + NOTCH_GAP;
  const cy = SCAN_SIZE / 2 - SCAN_LIFT; // button centre relative to the bar's top edge
  const shoulderY = 6;
  const dx = Math.sqrt(r * r - (shoulderY - cy) ** 2);
  const left = cx - dx;
  const right = cx + dx;
  const edge = [
    "M0 0",
    `L${left - FILLET} 0`,
    `C${left - FILLET / 3} 0 ${left - 1.5} ${shoulderY * 0.25} ${left} ${shoulderY}`,
    `A${r} ${r} 0 1 0 ${right} ${shoulderY}`,
    `C${right + 1.5} ${shoulderY * 0.25} ${right + FILLET / 3} 0 ${right + FILLET} 0`,
    `L${width} 0`,
  ].join(" ");
  return closed ? `${edge} L${width} ${height} L0 ${height} Z` : edge;
}

export function BottomTabBar(props: TabBarProps) {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { activeName, go } = useTabNavigation(props);
  const bottomPad = Math.max(insets.bottom, 6);
  const height = BAR_HEIGHT + bottomPad;
  const edge = notchPath(width, height, false);
  const shadowColor = t.scheme === "dark" ? "#000000" : "#0F172A";

  const renderTab = (tab: (typeof tabs)[number]) => {
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
        <Text variant="caption" tone={active ? "primary" : "muted"} weight={active ? "600" : "500"} numberOfLines={1}>
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[s.dock, { height }]}>
      {/* Bar surface with the notch, a soft shadow above it, and a hairline along its edge. */}
      <Svg width={width} height={height} style={s.dockSurface} pointerEvents="none">
        <Path d={edge} stroke={shadowColor} strokeOpacity={t.scheme === "dark" ? 0.5 : 0.06} strokeWidth={6} fill="none" />
        <Path d={notchPath(width, height)} fill={t.colors.surface} />
        <Path d={edge} stroke={t.colors.border} strokeWidth={1} fill="none" />
      </Svg>

      <View style={[s.dockRow, { paddingBottom: bottomPad }]} accessibilityRole="tablist">
        {tabs.slice(0, 2).map(renderTab)}
        <View style={s.scanSlot} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Text variant="caption" tone="muted" weight="600">
            Scan
          </Text>
        </View>
        {tabs.slice(2).map(renderTab)}
      </View>

      <Pressable
        onPress={() => router.push("/scan")}
        accessibilityRole="button"
        accessibilityLabel="Scan a QR code to pay"
        style={(state) => {
          const { pressed, hovered, focused } = state as InteractionState;
          return [
            s.scanButton,
            { left: width / 2 - SCAN_SIZE / 2 },
            (hovered || pressed) && s.scanButtonActive,
            pressed && s.scanButtonPressed,
            focused && s.scanFocused,
          ];
        }}
      >
        <Icon name="scan" size={26} color={t.colors.onPrimary} />
      </Pressable>
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
      <View style={s.sidebarActions}>
        <Button title="Send money" icon="paper-plane-outline" fullWidth onPress={() => router.push("/send")} />
        <Button title="Scan & pay" icon="scan" variant="soft" fullWidth onPress={() => router.push("/scan")} />
      </View>
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
  dock: { zIndex: 10 },
  dockSurface: { position: "absolute", top: 0, left: 0 },
  dockRow: { flex: 1, flexDirection: "row", paddingTop: 7 },
  scanSlot: { flex: 1, alignItems: "center", justifyContent: "flex-end", paddingBottom: 3 },
  scanButton: {
    position: "absolute",
    top: -SCAN_LIFT,
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: SCAN_SIZE / 2,
    backgroundColor: t.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    // Glow beneath, plus a soft inset highlight on the upper rim (no hard edges inside the button).
    boxShadow: `0px 10px 22px ${t.colors.primary}59, 0px 2px 6px ${t.colors.primary}40, inset 0px 1.5px 1px rgba(255,255,255,0.28)`,
    cursor: "pointer",
  },
  scanButtonActive: { backgroundColor: t.colors.primaryPressed },
  scanButtonPressed: { transform: [{ scale: 0.94 }] },
  scanFocused: { outlineColor: t.colors.focus, outlineWidth: 3, outlineStyle: "solid", outlineOffset: 3 },
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
  sidebarActions: { gap: t.space.sm },
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
