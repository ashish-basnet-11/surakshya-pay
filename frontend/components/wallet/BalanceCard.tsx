import { useState } from "react";
import { Pressable, View } from "react-native";
import { Icon, Skeleton, Text } from "@/components/ui";
import { formatMoney, shortAddress } from "@/lib/format";
import { usePreferences } from "@/store/use-preferences-store";
import { makeStyles, useTheme } from "@/theme";

export function BalanceCard({ balance, wallet, loading }: { balance?: string | null; wallet?: string | null; loading?: boolean }) {
  const t = useTheme();
  const s = useStyles();
  const hideByDefault = usePreferences((p) => p.hideBalance);
  const [hidden, setHidden] = useState(hideByDefault);

  return (
    <View style={s.card}>
      <View style={s.top}>
        <Text variant="small" color={t.colors.heroMuted}>
          Available balance
        </Text>
        <Pressable
          onPress={() => setHidden((h) => !h)}
          accessibilityRole="button"
          accessibilityLabel={hidden ? "Show balance" : "Hide balance"}
          hitSlop={10}
          style={s.eye}
        >
          <Icon name={hidden ? "eye-off-outline" : "eye-outline"} size={18} color={t.colors.heroMuted} />
        </Pressable>
      </View>
      {loading ? (
        <Skeleton width={200} height={36} style={s.skeleton} />
      ) : (
        <Text variant="display" color={t.colors.heroText} tabular accessibilityLabel={hidden ? "Balance hidden" : undefined} numberOfLines={1} adjustsFontSizeToFit>
          {hidden ? "NPR ••••••" : formatMoney(balance)}
        </Text>
      )}
      <View style={s.bottom}>
        <View style={s.chainPill}>
          <View style={s.dot} />
          <Text variant="caption" color={t.colors.heroMuted}>
            On-chain wallet
          </Text>
        </View>
        <Text variant="caption" color={t.colors.heroMuted} style={s.mono} numberOfLines={1}>
          {shortAddress(wallet)}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.hero,
    borderRadius: t.radius.xl,
    padding: t.space.xl,
    gap: t.space.sm,
    boxShadow: t.shadow.md,
  },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eye: { padding: 4, cursor: "pointer" },
  skeleton: { backgroundColor: "rgba(255,255,255,0.12)" },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.space.md, marginTop: t.space.md },
  chainPill: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ADE80" },
  mono: { fontFamily: "monospace" },
}));
