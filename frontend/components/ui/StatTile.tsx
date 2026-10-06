import { ReactNode } from "react";
import { View } from "react-native";
import { makeStyles, useTheme } from "@/theme";
import { Icon, IconName } from "./Icon";
import { Skeleton } from "./Skeleton";
import { Text } from "./Text";

type Tone = "primary" | "success" | "danger" | "warning" | "info" | "neutral";

export function StatTile({ label, value, icon, tone = "neutral", hint, loading }: { label: string; value: ReactNode; icon?: IconName; tone?: Tone; hint?: string; loading?: boolean }) {
  const t = useTheme();
  const s = useStyles();
  const soft = { primary: t.colors.primarySoft, success: t.colors.successSoft, danger: t.colors.dangerSoft, warning: t.colors.warningSoft, info: t.colors.infoSoft, neutral: t.colors.surfaceMuted }[tone];
  return (
    <View style={s.tile}>
      <View style={s.top}>
        <Text variant="small" tone="muted" numberOfLines={1} style={s.label}>
          {label}
        </Text>
        {icon && (
          <View style={[s.icon, { backgroundColor: soft }]}>
            <Icon name={icon} size={16} tone={tone === "neutral" ? "muted" : tone} />
          </View>
        )}
      </View>
      {loading ? (
        <Skeleton width="70%" height={26} />
      ) : (
        <Text variant="h2" tabular numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      )}
      {hint && (
        <Text variant="caption" tone="subtle" numberOfLines={1}>
          {hint}
        </Text>
      )}
    </View>
  );
}

/** Responsive grid: 2 columns on phones, up to `columns` on wider screens. */
export function StatGrid({ children }: { children: ReactNode }) {
  const s = useStyles();
  return <View style={s.grid}>{children}</View>;
}

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: t.space.md },
  tile: {
    flexGrow: 1,
    flexBasis: 150,
    minWidth: 140,
    gap: t.space.xs,
    padding: t.space.lg,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.space.sm },
  label: { flex: 1 },
  icon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
}));
