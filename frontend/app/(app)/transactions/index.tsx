import { useRouter } from "expo-router";
import { useState } from "react";
import { useTransactions } from "@/apis/transactions";
import { getDirection } from "@/lib/direction";
import { useMe } from "@/apis/user";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AppBar, Button, Card, EmptyState, QueryView, Screen, SegmentedControl, SkeletonRows } from "@/components/ui";

type Filter = "all" | "in" | "out";

export default function Transactions() {
  const router = useRouter();
  const me = useMe();
  const query = useTransactions();
  const [filter, setFilter] = useState<Filter>("all");
  const wallet = me.data?.wallet_address;


  return (
    <Screen
      appBar={<AppBar title="Transactions" subtitle={query.data ? `${query.data.length} total` : undefined} />}
      onRefresh={() => query.refetch()}
    >
      <SegmentedControl
        accessibilityLabel="Filter transactions"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "All" },
          { value: "in", label: "Money in", icon: "arrow-down" },
          { value: "out", label: "Money out", icon: "arrow-up" },
        ]}
      />
      <QueryView
        query={query}
        select={(list) => (filter === "all" ? list : list.filter((tx) => getDirection(tx, wallet) === filter))}
        loading={<SkeletonRows count={8} />}
        isEmpty={(d) => d.length === 0}
        empty={
          <Card>
            {filter === "all" ? (
              <EmptyState
                icon="receipt-outline"
                title="No transactions yet"
                message="Money you add, send, receive or withdraw will be listed here."
                action={<Button title="Add money" icon="add" size="sm" onPress={() => router.push("/topup")} />}
              />
            ) : (
              <EmptyState icon="funnel-outline" title={filter === "in" ? "No money in yet" : "No money out yet"} action={<Button title="Show all" size="sm" variant="secondary" onPress={() => setFilter("all")} />} />
            )}
          </Card>
        }
      >
        {(list) => <TransactionList items={list} wallet={wallet} grouped />}
      </QueryView>
    </Screen>
  );
}
