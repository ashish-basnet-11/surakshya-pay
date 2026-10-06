import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { getDirection } from "@/lib/direction";
import { Icon, IconName, InteractionState, Text } from "@/components/ui";
import { formatMoney, formatTime, titleCase } from "@/lib/format";
import { makeStyles, useTheme } from "@/theme";
import { Transaction } from "@/types/transaction";

type Tx = Pick<Transaction, "id" | "amount" | "category" | "description" | "timestamp" | "transaction_type"> & Partial<Transaction>;

/** Human title from the backend's description ("Transfer of 50 NPR to bob" → "To bob"). */
export function describeTransaction(tx: Tx, direction: "in" | "out"): { title: string; icon: IconName } {
  const type = tx.transaction_type?.toUpperCase();
  if (type === "DEPOSIT") return { title: "Added money", icon: "add" };
  if (type === "WITHDRAWAL" || type === "WITHDRAW") return { title: "Withdrawal", icon: "arrow-up" };
  const peer = tx.description?.match(direction === "in" ? /from (\S+)$/i : /to (\S+)$/i)?.[1];
  if (direction === "in") return { title: peer ? `From ${peer}` : "Money received", icon: "arrow-down" };
  return { title: peer ? `To ${peer}` : "Money sent", icon: "arrow-up" };
}

export function TransactionRow({ tx, wallet, showDate }: { tx: Tx; wallet?: string | null; showDate?: (iso: string) => string }) {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const direction = getDirection(tx, wallet);
  const { title, icon } = describeTransaction(tx, direction);
  const incoming = direction === "in";
  const category = tx.category && !["transfer", "deposit", "withdrawal", "withdraw"].includes(tx.category.toLowerCase()) ? titleCase(tx.category) : null;
  const when = showDate ? showDate(tx.timestamp) : formatTime(tx.timestamp);
  const amount = formatMoney(incoming ? Math.abs(tx.amount) : -Math.abs(tx.amount), { sign: true });

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/transactions/[id]", params: { id: String(tx.id) } })}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${amount}, ${when}`}
      style={(state) => {
        const { pressed, hovered, focused } = state as InteractionState;
        return [s.row, (pressed || hovered) && s.active, focused && s.focused];
      }}
    >
      <View style={[s.icon, { backgroundColor: incoming ? t.colors.successSoft : t.colors.surfaceMuted }]}>
        <Icon name={icon} size={18} tone={incoming ? "success" : "default"} />
      </View>
      <View style={s.body}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="small" tone="muted" numberOfLines={1}>
          {[category, when].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <Text variant="bodyStrong" tone={incoming ? "success" : "default"} tabular numberOfLines={1}>
        {amount}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.md,
    paddingHorizontal: t.space.lg,
    paddingVertical: t.space.md,
    minHeight: 64,
    cursor: "pointer",
  },
  active: { backgroundColor: t.colors.surfaceHover },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid", outlineOffset: -2 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0, gap: 2 },
}));
