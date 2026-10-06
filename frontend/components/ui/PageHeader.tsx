import { Stack } from "expo-router";
import { ReactNode } from "react";
import { View } from "react-native";
import { makeStyles } from "@/theme";
import { Text } from "./Text";

/** Large in-flow title for top-level (tab) pages; scrolls with the content. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  const s = useStyles();
  return (
    <View style={s.row}>
      <Stack.Screen options={{ title }} />
      <View style={s.titles}>
        <Text variant="h1" accessibilityRole="header">
          {title}
        </Text>
        {description && (
          <Text variant="body" tone="muted">
            {description}
          </Text>
        )}
      </View>
      {actions && <View style={s.actions}>{actions}</View>}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: "row", alignItems: "center", gap: t.space.md, flexWrap: "wrap" },
  titles: { flex: 1, minWidth: 200, gap: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: t.space.sm },
}));
