import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { getDirection } from "@/lib/direction";
import { Icon, IconName, InteractionState, Text } from "@/components/ui";
import { formatMoney, formatTime, titleCase } from "@/lib/format";
import { makeStyles, useTheme } from "@/theme";
import { Transaction } from "@/types/transaction";

type Tx = Pick<Transaction, "id" | "amount" | "category" | "description" | "timestamp" | "transaction_type"> & Partial<Transaction>;

const KHALTI_PURPLE = "#5C2D91";

/** Human title from the backend's description ("Transfer of 50 NPR to bob" → "To bob"). */
export function describeTransaction(tx: Tx, direction: "in" | "out"): { title: string; icon: IconName; khalti?: boolean } {
  const type = tx.transaction_type?.toUpperCase();
  // The backend tags these "Khalti top-up of N NPR (pidx …)".
  if (type === "DEPOSIT" && tx.description?.startsWith("Khalti")) return { title: "Khalti top-up", icon: "add", khalti: true };
  if (type === "DEPOSIT") return { title: "Added money", icon: "add" };
  if (type === "WITHDRAWAL" || type === "WITHDRAW") return { title: "Withdrawal", icon: "arrow-up" };
  // Backend descriptions: "Saved 50 NPR to Trip" / "Moved 50 NPR back from Trip".
  if (type === "SAVE") return { title: `Saved to ${tx.description?.match(/ to (.+)$/)?.[1] ?? "goal"}`, icon: "lock-closed" };
  if (type === "RELEASE") return { title: `From ${tx.description?.match(/ back from (.+)$/)?.[1] ?? "savings"}`, icon: "lock-open" };
  const peer = tx.description?.match(direction === "in" ? /from (\S+)$/i : /to (\S+)$/i)?.[1];
  if (direction === "in") return { title: peer ? `From ${peer}` : "Money received", icon: "arrow-down" };
  return { title: peer ? `To ${peer}` : "Money sent", icon: "arrow-up" };
}

/** Round badge for a transaction: Khalti's purple "K" for Khalti top-ups, otherwise the direction icon. */
export function TransactionIcon({ tx, direction, size = 40 }: { tx: Tx; direction: "in" | "out"; size?: number }) {
  const t = useTheme();
  const { icon, khalti } = describeTransaction(tx, direction);
  const incoming = direction === "in";
  const circle = { width: size, height: size, borderRadius: size / 2, alignItems: "center" as const, justifyContent: "center" as const };
  if (khalti)
    return (
      <View style={[circle, { backgroundColor: KHALTI_PURPLE }]} accessibilityLabel="Khalti">
        <Text color="#fff" style={{ fontWeight: "800", fontSize: size * 0.45, lineHeight: size * 0.55 }}>
          K
        </Text>
      </View>
    );
  return (
    <View style={[circle, { backgroundColor: incoming ? t.colors.successSoft : t.colors.surfaceMuted }]}>
      <Icon name={icon} size={Math.round(size * 0.45)} tone={incoming ? "success" : "default"} />
    </View>
  );
}

export function TransactionRow({ tx, wallet, showDate }: { tx: Tx; wallet?: string | null; showDate?: (iso: string) => string }) {
  const s = useStyles();
  const router = useRouter();
  const direction = getDirection(tx, wallet);
  const { title } = describeTransaction(tx, direction);
  const incoming = direction === "in";
  const category = tx.category && !["transfer", "deposit", "withdrawal", "withdraw", "savings"].includes(tx.category.toLowerCase()) ? titleCase(tx.category) : null;
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
      <TransactionIcon tx={tx} direction={direction} />
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
  body: { flex: 1, minWidth: 0, gap: 2 },
}));
