import { useRouter } from "expo-router";
import { useState } from "react";
import { useWithdraw } from "@/apis/transactions";
import { useMe } from "@/apis/user";
import { AppBar, Banner, Button, Card, dialog, Screen, toast } from "@/components/ui";
import { AmountInput } from "@/components/wallet/AmountInput";
import { getErrorMessage } from "@/lib/api";
import { formatMoney, toNumber } from "@/lib/format";
import { parseAmount } from "@/lib/validation";
import { goBack } from "@/lib/navigation";

export default function Withdraw() {
  const router = useRouter();
  const me = useMe();
  const withdraw = useWithdraw();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const balance = toNumber(me.data?.balance);

  const submit = async () => {
    const value = parseAmount(amount, 0);
    const problem = !amount ? "Enter an amount." : !(value > 0) ? "Enter a whole amount in NPR." : value > balance ? "That's more than your available balance." : null;
    setError(problem);
    if (problem) return;
    const ok = await dialog.confirm({
      title: `Withdraw ${formatMoney(value)}?`,
      message: `Your balance will be ${formatMoney(balance - value)} afterwards.`,
      confirmLabel: "Withdraw",
      icon: "arrow-up-circle-outline",
    });
    if (!ok) return;
    withdraw.mutate(value, {
      onSuccess: () => {
        toast.success("Withdrawal complete", `${formatMoney(value)} withdrawn.`);
        goBack(router);
      },
    });
  };

  return (
    <Screen
      appBar={<AppBar title="Withdraw" />}
      footer={<Button title="Withdraw" size="lg" fullWidth icon="arrow-up" loading={withdraw.isPending} disabled={balance <= 0} onPress={submit} />}
    >
      {withdraw.error && <Banner tone="danger" title="Withdrawal failed" message={getErrorMessage(withdraw.error)} />}
      {me.data && balance <= 0 && <Banner tone="warning" title="Nothing to withdraw" message="Your balance is empty. Add money first." />}
      <Card>
        <AmountInput
          value={amount}
          onChange={(v) => {
            setAmount(v);
            setError(null);
          }}
          error={error}
          available={balance}
          quickAmounts={[100, 500, 1000]}
          editable={!withdraw.isPending && balance > 0}
          autoFocus
        />
      </Card>
    </Screen>
  );
}
