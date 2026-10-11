import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useTransactions } from "@/apis/transactions";
import { Direction, filterTransactions, TxKind } from "@/lib/direction";
import { useMe } from "@/apis/user";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AppBar, Button, Card, Chip, ChipRow, DateField, EmptyState, IconButton, QueryView, Screen, SegmentedControl, SkeletonRows, TextField, toISODate } from "@/components/ui";
import { makeStyles } from "@/theme";

type Period = "all" | "7" | "30" | "90" | "custom";

const KINDS: { value: TxKind | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "transfer", label: "Transfers" },
  { value: "topup", label: "Top-ups" },
  { value: "withdrawal", label: "Withdrawals" },
  { value: "savings", label: "Savings" },
];

const PERIODS: { value: Period; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom" },
];

/** Local midnight of a YYYY-MM-DD string, as epoch ms. */
const dayStart = (iso: string, addDays = 0) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y ? new Date(y, m - 1, d + addDays).getTime() : null;
};

export default function Transactions() {
  const router = useRouter();
  const s = useStyles();
  const me = useMe();
  // ponytail: filtering is client-side over the latest 500 (backend max); move to query params if histories outgrow that.
  const query = useTransactions({ limit: 500 });
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState<Direction | "all">("all");
  const [kind, setKind] = useState<TxKind | "all">("all");
  const [period, setPeriod] = useState<Period>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const wallet = me.data?.wallet_address;

  const from = period === "custom" ? dayStart(fromDate) : period === "all" ? null : Date.now() - Number(period) * 86400000;
  const to = period === "custom" ? dayStart(toDate, 1) : null;
  const filtered = q.trim() !== "" || direction !== "all" || kind !== "all" || from != null || to != null;
  const clear = () => {
    setQ("");
    setDirection("all");
    setKind("all");
    setPeriod("all");
    setFromDate("");
    setToDate("");
  };
  const select = (list: NonNullable<typeof query.data>) => filterTransactions(list, { q, direction, kind, from, to }, wallet);
  const total = query.data?.length;
  const shown = query.data ? select(query.data).length : undefined;

  return (
    <Screen
      appBar={
        <AppBar
          title="Transactions"
          subtitle={total === undefined ? undefined : filtered ? `${shown} of ${total}` : `${total} total`}
          actions={filtered ? <Button title="Clear" size="sm" variant="secondary" onPress={clear} /> : undefined}
        />
      }
      onRefresh={() => query.refetch()}
    >
      <TextField
        placeholder="Search name, amount, category or hash"
        icon="search"
        value={q}
        onChangeText={setQ}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        trailing={q ? <IconButton icon="close-circle" label="Clear search" size={28} onPress={() => setQ("")} /> : undefined}
      />
      <SegmentedControl
        accessibilityLabel="Filter by direction"
        value={direction}
        onChange={setDirection}
        options={[
          { value: "all", label: "All" },
          { value: "in", label: "Money in", icon: "arrow-down" },
          { value: "out", label: "Money out", icon: "arrow-up" },
        ]}
      />
      <ChipRow>
        {KINDS.map((k) => (
          <Chip key={k.value} label={k.label} selected={kind === k.value} onPress={() => setKind(k.value)} />
        ))}
      </ChipRow>
      <ChipRow>
        {PERIODS.map((p) => (
          <Chip key={p.value} label={p.label} icon={p.value === "custom" ? "calendar-outline" : undefined} selected={period === p.value} onPress={() => setPeriod(p.value)} />
        ))}
      </ChipRow>
      {period === "custom" && (
        <View style={s.dates}>
          <View style={s.date}>
            <DateField label="From" value={fromDate} onChange={setFromDate} max={toDate || toISODate(new Date())} />
          </View>
          <View style={s.date}>
            <DateField label="To" value={toDate} onChange={setToDate} min={fromDate || undefined} max={toISODate(new Date())} />
          </View>
        </View>
      )}
      <QueryView
        query={query}
        select={select}
        loading={<SkeletonRows count={8} />}
        isEmpty={(d) => d.length === 0}
        empty={
          <Card>
            {filtered ? (
              <EmptyState
                icon="funnel-outline"
                title="No matching transactions"
                message="Try a different search or widen the filters."
                action={<Button title="Clear filters" size="sm" variant="secondary" onPress={clear} />}
              />
            ) : (
              <EmptyState
                icon="receipt-outline"
                title="No transactions yet"
                message="Money you add, send, receive or withdraw will be listed here."
                action={<Button title="Add money" icon="add" size="sm" onPress={() => router.push("/topup")} />}
              />
            )}
          </Card>
        }
      >
        {(list) => <TransactionList items={list} wallet={wallet} grouped />}
      </QueryView>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  dates: { flexDirection: "row", gap: t.space.md },
  date: { flex: 1 },
}));
