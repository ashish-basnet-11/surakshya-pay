import { useLocalSearchParams, useRouter } from "expo-router";
import { useCreateBudget } from "@/apis/budgets";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { AppBar, Screen, toast } from "@/components/ui";
import { BudgetType } from "@/types/budget";
import { goBack } from "@/lib/navigation";

export default function NewBudget() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: BudgetType }>();
  const create = useCreateBudget();

  return (
    <Screen appBar={<AppBar title="New budget" fallback="/budgets" />}>
      <BudgetForm
        initial={{ budget_type: type === "savings" || type === "investment" ? type : "expense" }}
        submitLabel="Create budget"
        loading={create.isPending}
        error={create.error}
        onCancel={() => goBack(router, "/budgets")}
        onSubmit={(input) =>
          create.mutate(input, {
            onSuccess: (budget) => {
              toast.success("Budget created", budget.name);
              router.replace({ pathname: "/budgets/[id]", params: { id: String(budget.id) } });
            },
          })
        }
      />
    </Screen>
  );
}
