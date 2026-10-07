import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useBudget, useDeleteBudget, useGoalMoney, useUpdateBudget } from "@/apis/budgets";
import { useMe } from "@/apis/user";
import { budgetHealth } from "@/components/budgets/BudgetCard";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { typeLabels } from "@/components/budgets/presets";
import { AmountInput } from "@/components/wallet/AmountInput";
import {
  AppBar,
  Badge,
  Banner,
  Button,
  Card,
  DetailList,
  dialog,
  ErrorState,
  Icon,
  ProgressBar,
  safeIconName,
  Screen,
  SegmentedControl,
  Skeleton,
  StatGrid,
  StatTile,
  Text,
  toast,
} from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { parseAmount } from "@/lib/validation";
import { Budget } from "@/types/budget";
import { makeStyles, useTheme } from "@/theme";
import { goBack } from "@/lib/navigation";

export default function BudgetDetail() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const budget = useBudget(id);
  const update = useUpdateBudget(id);
  const remove = useDeleteBudget();
  const [editing, setEditing] = useState(false);

  const b = budget.data;

  const confirmDelete = async () => {
    if (!b) return;
    const ok = await dialog.confirm({
      title: `Delete "${b.name}"?`,
      message:
        b.budget_type !== "expense" && b.spent_amount > 0
          ? `The ${formatMoney(b.spent_amount)} saved in this goal goes back to your wallet first.`
          : "This removes the budget and its progress. Your transactions are not affected.",
      confirmLabel: "Delete",
      destructive: true,
      icon: "trash-outline",
    });
    if (!ok) return;
    remove.mutate(id, {
      onSuccess: () => {
        toast.success("Budget deleted");
        goBack(router, "/budgets");
      },
      onError: (e) => toast.error(e),
    });
  };

  if (editing && b) {
    return (
      <Screen appBar={<AppBar title="Edit budget" onBack={() => setEditing(false)} />}>
        <BudgetForm
          initial={b}
          submitLabel="Save changes"
          loading={update.isPending}
          error={update.error}
          onCancel={() => setEditing(false)}
          onSubmit={(input) =>
            update.mutate(input, {
              onSuccess: () => {
                toast.success("Budget updated");
                setEditing(false);
              },
            })
          }
        />
      </Screen>
    );
  }

  const appBar = (
    <AppBar
      title={b?.name ?? "Budget"}
      fallback="/budgets"
      actions={
        b && (
          <>
            <Button title="Edit" icon="create-outline" variant="secondary" size="sm" onPress={() => setEditing(true)} />
            <Button title="Delete" icon="trash-outline" variant="ghost" size="sm" onPress={confirmDelete} loading={remove.isPending} />
          </>
        )
      }
    />
  );

  if (budget.isError && !b) {
    return (
      <Screen appBar={appBar}>
        <ErrorState error={budget.error} title="Couldn't load this budget" onRetry={() => budget.refetch()} />
      </Screen>
    );
  }

  const health = b ? budgetHealth(b) : null;
  const isExpense = b?.budget_type === "expense";

  return (
    <Screen appBar={appBar} onRefresh={() => budget.refetch()}>
      <Card style={s.hero}>
        {b ? (
          <>
            <View style={s.heroTop}>
              <View style={[s.icon, { backgroundColor: `${b.color}22` }]}>
                <Icon name={safeIconName(b.icon)} size={26} color={b.color} />
              </View>
              <View style={s.flex}>
                <Text variant="h2" numberOfLines={2}>
                  {b.name}
                </Text>
                <Text variant="small" tone="muted">
                  {b.category} · {typeLabels[b.budget_type]}
                </Text>
              </View>
              {health && <Badge label={health.label} tone={health.tone} />}
            </View>
            <View style={s.amounts}>
              <Text variant="display" tabular>
                {formatMoney(b.spent_amount)}
              </Text>
              <Text variant="body" tone="muted" tabular>
                {isExpense ? "spent of" : "saved of"} {formatMoney(b.budget_amount)}
              </Text>
            </View>
            <ProgressBar
              value={b.progress_percentage / 100}
              height={12}
              color={isExpense && b.is_over_budget ? t.colors.danger : isExpense && b.progress_percentage >= 80 ? t.colors.warning : b.color}
            />
            <Text variant="small" tone="muted">
              {Math.round(b.progress_percentage)}% {isExpense ? "of your limit used" : "of your goal reached"}
            </Text>
          </>
        ) : (
          <>
            <Skeleton width="50%" height={22} />
            <Skeleton width="70%" height={36} />
            <Skeleton height={12} />
          </>
        )}
      </Card>

      <StatGrid>
        <StatTile label={isExpense ? "Remaining" : "To go"} value={b ? formatMoney(Math.max(b.remaining, 0)) : ""} icon="hourglass-outline" tone="primary" loading={!b} />
        <StatTile label={isExpense ? "Limit" : "Target"} value={b ? formatMoney(b.budget_amount) : ""} icon="flag-outline" loading={!b} />
        {isExpense && b?.is_over_budget && <StatTile label="Over by" value={formatMoney(-b.remaining)} icon="alert-circle-outline" tone="danger" />}
      </StatGrid>

      <Card style={s.details}>
        <Text variant="h3">Details</Text>
        <DetailList
          items={[
            { label: "Type", value: b ? typeLabels[b.budget_type] : "…" },
            { label: "Category", value: b?.category },
            { label: "Starts", value: b ? formatDate(b.start_date) : "…" },
            { label: "Ends", value: b?.end_date ? formatDate(b.end_date) : "No end date" },
            { label: "Last updated", value: b ? formatDate(b.updated_at, { dateStyle: "medium", timeStyle: "short" }) : "…" },
            ...(b?.description ? [{ label: "Notes", value: b.description }] : []),
          ]}
        />
      </Card>

      {b && !isExpense && <GoalMoneyCard budget={b} />}

      <Text variant="small" tone="subtle">
        {isExpense
          ? `Payments you tag with the category "${b?.category}" when sending money count toward this budget automatically.`
          : "Money saved here is locked in your on-chain wallet: you can't spend it until you move it back."}
      </Text>
    </Screen>
  );
}

/** Save into a goal or move money back. Both are on-chain transactions on the user's wallet. */
function GoalMoneyCard({ budget }: { budget: Budget }) {
  const s = useStyles();
  const me = useMe();
  const move = useGoalMoney(budget.id);
  const [action, setAction] = useState<"save" | "release">("save");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const spendable = Number(me.data?.balance ?? 0);
  const limit = action === "save" ? spendable : budget.spent_amount;

  const submit = () => {
    const value = parseAmount(amount, 0);
    const problem = !(value > 0)
      ? "Enter a whole amount in NPR."
      : value > limit
        ? action === "save"
          ? `You only have ${formatMoney(spendable)} available.`
          : `This goal only has ${formatMoney(budget.spent_amount)} saved.`
        : null;
    setError(problem);
    if (problem) return;
    move.mutate(
      { action, amount: value },
      {
        onSuccess: () => {
          setAmount("");
          toast.success(action === "save" ? "Saved to goal" : "Moved back to wallet", `${formatMoney(value)} ${action === "save" ? `locked in "${budget.name}"` : "is spendable again"}.`);
        },
      }
    );
  };

  return (
    <Card style={s.details}>
      <Text variant="h3">Move money</Text>
      <SegmentedControl
        accessibilityLabel="Direction"
        value={action}
        onChange={(a) => {
          setAction(a);
          setError(null);
          move.reset();
        }}
        options={[
          { value: "save", label: "Save to goal", icon: "lock-closed-outline" },
          { value: "release", label: "Move back", icon: "lock-open-outline" },
        ]}
      />
      {move.error && <Banner tone="danger" title="Couldn't move money" message={getErrorMessage(move.error)} />}
      <AmountInput
        value={amount}
        onChange={(v) => {
          setAmount(v);
          setError(null);
        }}
        error={error}
        available={action === "save" ? spendable : undefined}
        quickAmounts={[100, 500, 1000]}
        hint={action === "release" ? `Saved in this goal: ${formatMoney(budget.spent_amount)}` : undefined}
        editable={!move.isPending}
      />
      <Button
        title={action === "save" ? "Save to goal" : "Move back to wallet"}
        icon={action === "save" ? "lock-closed" : "lock-open"}
        fullWidth
        loading={move.isPending}
        disabled={action === "release" && budget.spent_amount <= 0}
        onPress={submit}
      />
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { gap: t.space.md },
  heroTop: { flexDirection: "row", alignItems: "center", gap: t.space.md },
  icon: { width: 52, height: 52, borderRadius: t.radius.lg, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0 },
  amounts: { gap: 2, marginTop: t.space.sm },
  details: { gap: t.space.xs },
}));
