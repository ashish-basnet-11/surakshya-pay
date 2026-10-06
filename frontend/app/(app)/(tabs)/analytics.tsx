import { useRouter } from "expo-router";
import { View } from "react-native";
import { useStatistics } from "@/apis/transactions";
import { useMe } from "@/apis/user";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import {
  Button,
  Card,
  DetailList,
  EmptyState,
  ErrorState,
  PageHeader,
  ProgressBar,
  Screen,
  Section,
  Skeleton,
  StatGrid,
  StatTile,
  Text,
} from "@/components/ui";
import { formatDate, formatMoney, titleCase } from "@/lib/format";
import { makeStyles, useBreakpoint } from "@/theme";

const chartColors = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

export default function Analytics() {
  const s = useStyles();
  const router = useRouter();
  const { atLeastTablet } = useBreakpoint();
  const stats = useStatistics();
  const me = useMe();

  const d = stats.data;
  const categories = Object.entries(d?.spending_by_category ?? {})
    .map(([name, amount]) => ({ name, amount: Math.abs(amount) }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const totalSpent = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Screen insetBottom={false} width="wide" onRefresh={() => Promise.all([stats.refetch(), me.refetch()])}>
      <PageHeader title="Analytics" description="Where your money comes from and where it goes." />

      {stats.isError && !d ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
      ) : (
        <>
          <StatGrid>
            <StatTile label="Money in" icon="arrow-down" tone="success" value={formatMoney(d?.total_income)} loading={!d} />
            <StatTile label="Money out" icon="arrow-up" tone="danger" value={formatMoney(d?.total_expense)} loading={!d} />
            <StatTile label="Balance" icon="wallet-outline" tone="primary" value={formatMoney(d?.balance)} loading={!d} />
            <StatTile label="Transactions" icon="swap-vertical" value={String(d?.transaction_count ?? 0)} loading={!d} />
          </StatGrid>

          {d && d.transaction_count === 0 ? (
            <Card>
              <EmptyState
                icon="analytics-outline"
                title="Nothing to analyse yet"
                message="Once you send, receive or add money, your spending patterns will show up here."
                action={<Button title="Add money" icon="add" size="sm" onPress={() => router.push("/topup")} />}
              />
            </Card>
          ) : (
            <View style={[s.columns, atLeastTablet && s.columnsWide]}>
              <View style={[s.col, atLeastTablet && s.colWide]}>
                <Section title="Spending by category" description={d ? `${formatMoney(totalSpent)} across ${categories.length} categories` : undefined}>
                  <Card>
                    {!d ? (
                      <View style={s.bars}>
                        {[0, 1, 2, 3].map((i) => (
                          <View key={i} style={s.bar}>
                            <Skeleton width="40%" />
                            <Skeleton height={8} />
                          </View>
                        ))}
                      </View>
                    ) : categories.length === 0 ? (
                      <EmptyState icon="pie-chart-outline" title="No spending yet" message="Payments and withdrawals will be broken down here." compact />
                    ) : (
                      <View style={s.bars}>
                        {categories.map((c, i) => (
                          <View key={c.name} style={s.bar}>
                            <View style={s.barLabel}>
                              <View style={[s.swatch, { backgroundColor: chartColors[i % chartColors.length] }]} />
                              <Text variant="smallStrong" style={s.flex} numberOfLines={1}>
                                {titleCase(c.name)}
                              </Text>
                              <Text variant="small" tone="muted" tabular>
                                {Math.round((c.amount / totalSpent) * 100)}%
                              </Text>
                              <Text variant="smallStrong" tabular>
                                {formatMoney(c.amount)}
                              </Text>
                            </View>
                            <ProgressBar value={c.amount / categories[0].amount} color={chartColors[i % chartColors.length]} />
                          </View>
                        ))}
                      </View>
                    )}
                  </Card>
                </Section>
                <Section title="Transaction size">
                  <Card style={s.detailCard}>
                    <DetailList
                      items={[
                        { label: "Average", value: d ? formatMoney(d.average_transaction_amount) : "…" },
                        { label: "Smallest", value: d ? formatMoney(d.min_transaction_amount) : "…" },
                        { label: "Largest", value: d ? formatMoney(d.max_transaction_amount) : "…" },
                      ]}
                    />
                  </Card>
                </Section>
              </View>
              <View style={[s.col, atLeastTablet && s.colWide]}>
                <Section
                  title="Latest transactions"
                  action={<Button title="See all" variant="ghost" size="sm" iconRight="chevron-forward" onPress={() => router.push("/transactions")} />}
                >
                  <Card padded={false}>
                    {!d ? (
                      <View style={s.bars}>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </View>
                    ) : (
                      d.recent_transactions.map((tx, i) => (
                        <View key={tx.id} style={i > 0 ? s.sep : undefined}>
                          <TransactionRow tx={tx} wallet={me.data?.wallet_address} showDate={(iso) => formatDate(iso, { month: "short", day: "numeric" })} />
                        </View>
                      ))
                    )}
                  </Card>
                </Section>
              </View>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  columns: { gap: t.space.xxl },
  columnsWide: { flexDirection: "row", alignItems: "flex-start" },
  col: { gap: t.space.xxl },
  colWide: { flex: 1, minWidth: 0 },
  bars: { gap: t.space.lg, padding: t.space.xs },
  bar: { gap: t.space.sm },
  barLabel: { flexDirection: "row", alignItems: "center", gap: t.space.sm },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  flex: { flex: 1 },
  detailCard: { paddingVertical: t.space.xs },
  sep: { borderTopWidth: 1, borderTopColor: t.colors.border },
}));
