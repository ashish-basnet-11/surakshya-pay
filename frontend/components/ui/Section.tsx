import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { makeStyles } from "@/theme";
import { Text } from "./Text";

interface SectionProps {
  title?: string;
  description?: string;
  /** e.g. a "See all" link */
  action?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Section({ title, description, action, children, style }: SectionProps) {
  const s = useStyles();
  return (
    <View style={[s.section, style]}>
      {(title || action) && (
        <View style={s.header}>
          <View style={s.titles}>
            {title && (
              <Text variant="h3" accessibilityRole="header">
                {title}
              </Text>
            )}
            {description && (
              <Text variant="small" tone="muted">
                {description}
              </Text>
            )}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  section: { gap: t.space.md },
  header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: t.space.md },
  titles: { flex: 1, gap: 2 },
}));
