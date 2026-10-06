import { Href, Stack, useRouter } from "expo-router";
import { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles } from "@/theme";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { goBack } from "@/lib/navigation";

interface AppBarProps {
  title: string;
  subtitle?: string;
  /** Where Back goes when there is no history (deep link / page refresh on web). */
  fallback?: Href;
  showBack?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
}

export function AppBar({ title, subtitle, fallback = "/", showBack = true, onBack, actions }: AppBarProps) {
  const s = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => (onBack ? onBack() : goBack(router, fallback));

  return (
    <View style={[s.bar, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title }} />
      <View style={s.row}>
        {showBack && <IconButton icon="arrow-back" label="Go back" onPress={handleBack} />}
        <View style={s.titles}>
          <Text variant="h3" numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
          {subtitle && (
            <Text variant="small" tone="muted" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {actions && <View style={s.actions}>{actions}</View>}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  bar: {
    backgroundColor: t.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
    zIndex: 1,
  },
  row: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.sm,
    paddingHorizontal: t.space.sm,
    width: "100%",
    maxWidth: 1160,
    alignSelf: "center",
  },
  titles: { flex: 1, minWidth: 0, paddingHorizontal: t.space.xs },
  actions: { flexDirection: "row", alignItems: "center", gap: t.space.xs },
}));
