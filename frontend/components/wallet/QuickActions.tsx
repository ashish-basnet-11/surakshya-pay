import { Href, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Icon, IconName, InteractionState, Text } from "@/components/ui";
import { makeStyles } from "@/theme";

const actions: { label: string; icon: IconName; href: Href }[] = [
  { label: "Send", icon: "paper-plane-outline", href: "/send" },
  { label: "Add money", icon: "add-circle-outline", href: "/topup" },
  { label: "Withdraw", icon: "arrow-up-circle-outline", href: "/withdraw" },
  { label: "Receive", icon: "qr-code-outline", href: { pathname: "/scan", params: { tab: "code" } } },
];

export function QuickActions() {
  const s = useStyles();
  const router = useRouter();
  return (
    <View style={s.grid}>
      {actions.map((a) => (
        <Pressable
          key={a.label}
          onPress={() => router.push(a.href)}
          accessibilityRole="button"
          accessibilityLabel={a.label}
          style={(state) => {
            const { pressed, hovered, focused } = state as InteractionState;
            return [s.item, (pressed || hovered) && s.itemActive, focused && s.focused];
          }}
        >
          <View style={s.icon}>
            <Icon name={a.icon} size={22} tone="primary" />
          </View>
          <Text variant="smallStrong" align="center" numberOfLines={2}>
            {a.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: "row", gap: t.space.sm },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: t.space.sm,
    paddingVertical: t.space.md,
    paddingHorizontal: t.space.xs,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    cursor: "pointer",
  },
  itemActive: { backgroundColor: t.colors.surfaceHover, borderColor: t.colors.borderStrong },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid" },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.colors.primarySoft, alignItems: "center", justifyContent: "center" },
}));
