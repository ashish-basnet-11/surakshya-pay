import { ReactNode } from "react";
import { View } from "react-native";
import { makeStyles, useTheme } from "@/theme";
import { Icon, IconName } from "./Icon";
import { Text } from "./Text";

type Tone = "info" | "success" | "warning" | "danger";

const icons: Record<Tone, IconName> = {
  info: "information-circle",
  success: "checkmark-circle",
  warning: "warning",
  danger: "alert-circle",
};

/** Inline, persistent message (form errors, account notices). */
export function Banner({ tone = "info", title, message, action }: { tone?: Tone; title?: string; message?: string; action?: ReactNode }) {
  const t = useTheme();
  const s = useStyles();
  const soft = { info: t.colors.infoSoft, success: t.colors.successSoft, warning: t.colors.warningSoft, danger: t.colors.dangerSoft }[tone];
  return (
    <View style={[s.banner, { backgroundColor: soft }]} accessibilityRole={tone === "danger" ? "alert" : undefined} accessibilityLiveRegion="polite">
      <Icon name={icons[tone]} size={20} tone={tone} />
      <View style={s.body}>
        {title && <Text variant="smallStrong">{title}</Text>}
        {message && (
          <Text variant="small" tone="muted">
            {message}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.md,
    padding: t.space.md + 2,
    borderRadius: t.radius.md,
  },
  body: { flex: 1, gap: 2 },
}));
