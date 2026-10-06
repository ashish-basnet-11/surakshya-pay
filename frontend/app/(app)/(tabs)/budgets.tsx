import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { useBudgets, useBudgetSummary } from "@/apis/budgets";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import {
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  ProgressBar,
  Screen,
  SegmentedControl,
  Skeleton,
  Text,
  TextField,
} from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { makeStyles, useBreakpoint, useTheme } from "@/theme";
import { BudgetStatus } from "@/types/budget";

type Filter = "all" | BudgetStatus;

export default function Budgets() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { atLeastTablet } = useBreakpoint();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const summary = useBudgetSummary();
  const budgets = useBudgets({ status: filter === "all" ? undefined : filter });


  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = budgets.data ?? [];
    return q ? list.filter((b) => `${b.name} ${b.category}`.toLowerCase().includes(q)) : list;
  }, [budgets.data, search]);

  const sum = summary.data;
  const usage = sum && sum.monthly_budget > 0 ? sum.monthly_spent / sum.monthly_budget : 0;
  const hasAny = (sum?.statistics.total_budgets ?? 0) > 0;
  const newBudget = () => router.push("/budgets/new");

  return (
    <Screen insetBottom={false} width="wide" onRefresh={() => Promise.all([summary.refetch(), budgets.refetch()])}>
      <PageHeader
        title="Budgets"
        description="Spending limits and savings goals."
        actions={<Button title={atLeastTablet ? "New budget" : "New"} icon="add" onPress={newBudget} />}
      />

      <Card style={s.summary}>
        <View style={s.summaryTop}>
          <View style={s.flex}>
            <Text variant="small" tone="muted">
              Spent this month
            </Text>
            {sum ? (
              <Text variant="h1" tabular>
                {formatMoney(sum.monthly_spent)}
              </Text>
            ) : (
              <Skeleton width={180} height={30} />
            )}
          </View>
          <View style={s.summaryRight}>
            <Text variant="small" tone="muted">
              Budgeted
            </Text>
            <Text variant="bodyStrong" tabular>
              {sum ? formatMoney(sum.monthly_budget) : "…"}
            </Text>
          </View>
        </View>
        <ProgressBar value={usage} color={usage > 1 ? t.colors.danger : usage > 0.8 ? t.colors.warning : t.colors.primary} height={10} />
        <View style={s.summaryStats}>
          <Text variant="small" tone="muted">
            {sum ? `${formatMoney(Math.max(sum.monthly_remaining, 0))} remaining` : " "}
          </Text>
          <Text variant="small" tone="muted">
            {sum ? `${sum.statistics.active_budgets} active · ${sum.statistics.completed_budgets} completed` : ""}
          </Text>
        </View>
      </Card>

      {!!sum?.warning_count && (
        <Banner
          tone="warning"
          title={`${sum.warning_count} ${sum.warning_count === 1 ? "budget is" : "budgets are"} close to the limit`}
          message="Review them to avoid overspending."
          action={<Button title="Show" size="sm" variant="secondary" onPress={() => setFilter("warning")} />}
        />
      )}

      {(hasAny || filter !== "all") && (
        <View style={[s.controls, atLeastTablet && s.controlsWide]}>
          <View style={atLeastTablet ? s.segmentWide : undefined}>
            <SegmentedControl
              accessibilityLabel="Filter budgets"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "warning", label: "At risk" },
                { value: "completed", label: "Done" },
              ]}
            />
          </View>
          <TextField
            placeholder="Search budgets"
            icon="search"
            value={search}
            onChangeText={setSearch}
            containerStyle={atLeastTablet ? s.searchWide : undefined}
            returnKeyType="search"
            trailing={search ? <IconButton icon="close-circle" label="Clear search" size={28} onPress={() => setSearch("")} /> : undefined}
          />
        </View>
      )}

      {budgets.isError && !budgets.data ? (
        <ErrorState error={budgets.error} onRetry={() => budgets.refetch()} />
      ) : !budgets.data ? (
        <View style={s.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} style={[s.cell, s.skeletonCard]}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={22} />
              <Skeleton height={8} />
            </Card>
          ))}
        </View>
      ) : visible.length === 0 ? (
        <Card>
          {search ? (
            <EmptyState icon="search" title="No matches" message={`Nothing matches "${search}".`} action={<Button title="Clear search" variant="secondary" size="sm" onPress={() => setSearch("")} />} />
          ) : filter !== "all" ? (
            <EmptyState icon="funnel-outline" title="Nothing here" message="No budgets have this status right now." action={<Button title="Show all" variant="secondary" size="sm" onPress={() => setFilter("all")} />} />
          ) : (
            <EmptyState
              icon="wallet-outline"
              title="Create your first budget"
              message="Set a monthly spending limit or a savings goal and track it as you pay."
              action={<Button title="New budget" icon="add" size="sm" onPress={newBudget} />}
            />
          )}
        </Card>
      ) : (
        <View style={s.grid}>
          {visible.map((b) => (
            <View key={b.id} style={s.cell}>
              <BudgetCard budget={b} />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  flex: { flex: 1, minWidth: 0 },
  summary: { gap: t.space.md },
  summaryTop: { flexDirection: "row", alignItems: "flex-end", gap: t.space.lg, flexWrap: "wrap" },
  summaryRight: { alignItems: "flex-end" },
  summaryStats: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: t.space.sm },
  controls: { gap: t.space.md },
  controlsWide: { flexDirection: "row", alignItems: "center" },
  segmentWide: { flex: 1, maxWidth: 420 },
  searchWide: { flex: 1, maxWidth: 320, marginLeft: "auto" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: t.space.md },
  cell: { flexGrow: 1, flexBasis: 320, minWidth: 0 },
  skeletonCard: { gap: t.space.md },
}));
