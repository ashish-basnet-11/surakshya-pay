import { Fragment } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui";
import { dayLabel, formatDate } from "@/lib/format";
import { makeStyles } from "@/theme";
import { Transaction } from "@/types/transaction";
import { TransactionRow } from "./TransactionRow";

/** Card of transactions; `grouped` splits it under Today / Yesterday / date headings. */
export function TransactionList({ items, wallet, grouped }: { items: Transaction[]; wallet?: string | null; grouped?: boolean }) {
  const s = useStyles();

  if (!grouped) {
    return (
      <View style={s.card}>
        {items.map((tx, i) => (
          <Fragment key={tx.id}>
            {i > 0 && <View style={s.sep} />}
            <TransactionRow tx={tx} wallet={wallet} showDate={(iso) => formatDate(iso, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} />
          </Fragment>
        ))}
      </View>
    );
  }

  const groups: { label: string; items: Transaction[] }[] = [];
  for (const tx of items) {
    const label = dayLabel(tx.timestamp);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(tx);
    else groups.push({ label, items: [tx] });
  }

  return (
    <View style={s.groups}>
      {groups.map((g) => (
        <View key={g.label} style={s.group}>
          <Text variant="overline" tone="subtle" style={s.groupLabel}>
            {g.label}
          </Text>
          <View style={s.card}>
            {g.items.map((tx, i) => (
              <Fragment key={tx.id}>
                {i > 0 && <View style={s.sep} />}
                <TransactionRow tx={tx} wallet={wallet} />
              </Fragment>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: "hidden",
  },
  sep: { height: 1, backgroundColor: t.colors.border, marginLeft: 72 },
  groups: { gap: t.space.xl },
  group: { gap: t.space.sm },
  groupLabel: { paddingHorizontal: t.space.xs },
}));
