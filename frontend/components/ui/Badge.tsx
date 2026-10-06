import { View } from "react-native";
import { makeStyles, useTheme } from "@/theme";
import { Icon, IconName } from "./Icon";
import { Text } from "./Text";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export function Badge({ label, tone = "neutral", icon }: { label: string; tone?: BadgeTone; icon?: IconName }) {
  const t = useTheme();
  const s = useStyles();
  const map = {
    neutral: [t.colors.surfaceMuted, t.colors.textMuted],
    primary: [t.colors.primarySoft, t.colors.primary],
    success: [t.colors.successSoft, t.colors.success],
    warning: [t.colors.warningSoft, t.colors.warning],
    danger: [t.colors.dangerSoft, t.colors.danger],
    info: [t.colors.infoSoft, t.colors.info],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      {icon && <Icon name={icon} size={12} color={fg} />}
      <Text variant="caption" color={fg} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: t.space.sm,
    paddingVertical: 3,
    borderRadius: t.radius.full,
  },
}));

/** Consistent label/tone for KYC state everywhere it appears. */
export function kycBadge(status?: string | null): { label: string; tone: BadgeTone; icon: IconName } {
  switch (status) {
    case "approved":
      return { label: "Verified", tone: "success", icon: "checkmark-circle" };
    case "pending":
      return { label: "In review", tone: "info", icon: "time" };
    case "rejected":
    case "resubmit_required":
      return { label: "Action needed", tone: "danger", icon: "alert-circle" };
    default:
      return { label: "Not verified", tone: "warning", icon: "shield-outline" };
  }
}
