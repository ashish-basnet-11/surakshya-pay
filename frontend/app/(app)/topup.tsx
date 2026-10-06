import { useRouter } from "expo-router";
import { useState } from "react";
import { useTopUp } from "@/apis/transactions";
import { useMe } from "@/apis/user";
import { AppBar, Banner, Button, Card, Screen, toast } from "@/components/ui";
import { AmountInput } from "@/components/wallet/AmountInput";
import { getErrorMessage } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { parseAmount } from "@/lib/validation";
import { goBack } from "@/lib/navigation";

const MIN = 1;
const MAX = 5000;

export default function TopUp() {
  const router = useRouter();
  const me = useMe();
  const topUp = useTopUp();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const value = parseAmount(amount, 0);
    const problem = !amount
      ? "Enter an amount."
      : !(value > 0)
        ? "Enter a whole amount in NPR."
        : value < MIN
          ? `The minimum is ${formatMoney(MIN)}.`
          : value > MAX
            ? `You can add up to ${formatMoney(MAX)} at a time.`
            : null;
    setError(problem);
    if (problem) return;
    topUp.mutate(value, {
      onSuccess: () => {
        toast.success("Money added", `${formatMoney(value)} is now in your wallet.`);
        goBack(router);
      },
    });
  };

  return (
    <Screen
      appBar={<AppBar title="Add money" subtitle={me.data ? `Balance ${formatMoney(me.data.balance)}` : undefined} />}
      footer={<Button title="Add money" size="lg" fullWidth icon="add" loading={topUp.isPending} onPress={submit} />}
    >
      {topUp.error && <Banner tone="danger" title="Couldn't add money" message={getErrorMessage(topUp.error)} />}
      <Card>
        <AmountInput
          value={amount}
          onChange={(v) => {
            setAmount(v);
            setError(null);
          }}
          error={error}
          quickAmounts={[100, 500, 1000, 5000]}
          hint={`Between ${formatMoney(MIN)} and ${formatMoney(MAX)} per top-up.`}
          editable={!topUp.isPending}
          autoFocus
        />
      </Card>
      <Banner tone="info" message="Funds are minted to your on-chain wallet and appear in your balance once the transaction is confirmed." />
    </Screen>
  );
}
