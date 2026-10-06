import { useRouter } from "expo-router";
import { View } from "react-native";
import { Badge, BadgeTone, Card, Icon, ProgressBar, safeIconName, Text } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { makeStyles, useTheme } from "@/theme";
import { Budget } from "@/types/budget";
import { typeLabels } from "./presets";

export function budgetHealth(b: Pick<Budget, "budget_type" | "progress_percentage" | "is_over_budget" | "status">): { label: string; tone: BadgeTone } {
  if (b.status === "completed") return { label: b.budget_type === "expense" ? "Ended" : "Reached", tone: "success" };
  if (b.budget_type !== "expense") return { label: `${Math.round(b.progress_percentage)}% saved`, tone: "primary" };
  if (b.is_over_budget) return { label: "Over budget", tone: "danger" };
  if (b.progress_percentage >= 80) return { label: "Near limit", tone: "warning" };
  return { label: "On track", tone: "success" };
}

export function BudgetCard({ budget }: { budget: Budget }) {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const health = budgetHealth(budget);
  const isExpense = budget.budget_type === "expense";
  const barColor = isExpense ? (budget.is_over_budget ? t.colors.danger : budget.progress_percentage >= 80 ? t.colors.warning : budget.color) : budget.color;

  return (
    <Card
      onPress={() => router.push({ pathname: "/budgets/[id]", params: { id: String(budget.id) } })}
      accessibilityLabel={`${budget.name}, ${formatMoney(budget.spent_amount)} of ${formatMoney(budget.budget_amount)}, ${health.label}`}
      style={s.card}
    >
      <View style={s.top}>
        <View style={[s.icon, { backgroundColor: `${budget.color}22` }]}>
          <Icon name={safeIconName(budget.icon)} size={20} color={budget.color} />
        </View>
        <View style={s.titles}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {budget.name}
          </Text>
          <Text variant="small" tone="muted" numberOfLines={1}>
            {budget.category} · {typeLabels[budget.budget_type]}
          </Text>
        </View>
        <Badge label={health.label} tone={health.tone} />
      </View>
      <View style={s.amounts}>
        <Text variant="h3" tabular>
          {formatMoney(budget.spent_amount)}
        </Text>
        <Text variant="small" tone="muted" tabular>
          of {formatMoney(budget.budget_amount)}
        </Text>
      </View>
      <ProgressBar value={budget.progress_percentage / 100} color={barColor} />
      <View style={s.bottom}>
        <Text variant="small" tone={budget.remaining < 0 ? "danger" : "muted"} tabular>
          {budget.remaining < 0
            ? `${formatMoney(-budget.remaining)} over`
            : `${formatMoney(budget.remaining)} ${isExpense ? "left" : "to go"}`}
        </Text>
        {budget.end_date && (
          <Text variant="small" tone="subtle">
            Ends {formatDate(budget.end_date)}
          </Text>
        )}
      </View>
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  card: { gap: t.space.md },
  top: { flexDirection: "row", alignItems: "center", gap: t.space.md },
  icon: { width: 40, height: 40, borderRadius: t.radius.md, alignItems: "center", justifyContent: "center" },
  titles: { flex: 1, minWidth: 0 },
  amounts: { flexDirection: "row", alignItems: "baseline", gap: t.space.sm, flexWrap: "wrap" },
  bottom: { flexDirection: "row", justifyContent: "space-between", gap: t.space.sm, flexWrap: "wrap" },
}));
