import { useRouter } from "expo-router";
import { useState } from "react";
import { useKhaltiTopUp } from "@/apis/payments/khalti";
import { useTopUp } from "@/apis/transactions";
import { useMe } from "@/apis/user";
import { AppBar, Banner, Button, Card, Screen, SegmentedControl, toast } from "@/components/ui";
import { AmountInput } from "@/components/wallet/AmountInput";
import { getErrorMessage } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { parseAmount } from "@/lib/validation";
import { goBack } from "@/lib/navigation";

const MAX = 5000;

type Method = "khalti" | "instant";
const MIN: Record<Method, number> = { khalti: 10, instant: 1 }; // Khalti rejects payments under Rs. 10

export default function TopUp() {
  const router = useRouter();
  const me = useMe();
  const instant = useTopUp();
  const khalti = useKhaltiTopUp();
  const [method, setMethod] = useState<Method>("khalti");
  const topUp = method === "khalti" ? khalti : instant;
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const value = parseAmount(amount, 0);
    const problem = !amount
      ? "Enter an amount."
      : !(value > 0)
        ? "Enter a whole amount in NPR."
        : value < MIN[method]
          ? `The minimum is ${formatMoney(MIN[method])}.`
          : value > MAX
            ? `You can add up to ${formatMoney(MAX)} at a time.`
            : null;
    setError(problem);
    if (problem) return;
    const onSuccess = () => {
      toast.success("Money added", `${formatMoney(value)} is now in your wallet.`);
      goBack(router);
    };
    if (method === "khalti") khalti.mutate(value, { onSuccess });
    else instant.mutate(value, { onSuccess });
  };

  return (
    <Screen
      appBar={<AppBar title="Add money" subtitle={me.data ? `Balance ${formatMoney(me.data.balance)}` : undefined} />}
      footer={<Button title={method === "khalti" ? "Pay with Khalti" : "Add money"} size="lg" fullWidth icon="add" loading={topUp.isPending} onPress={submit} />}
    >
      {topUp.error && <Banner tone="danger" title="Couldn't add money" message={getErrorMessage(topUp.error)} />}
      <SegmentedControl
        accessibilityLabel="Top-up method"
        value={method}
        onChange={(m) => {
          setMethod(m);
          setError(null);
          instant.reset();
          khalti.reset();
        }}
        options={[
          { value: "khalti", label: "Khalti (Sandbox)", icon: "card" },
          { value: "instant", label: "Instant (demo)", icon: "flash" },
        ]}
      />
      <Card>
        <AmountInput
          value={amount}
          onChange={(v) => {
            setAmount(v);
            setError(null);
          }}
          error={error}
          quickAmounts={[100, 500, 1000, 5000]}
          hint={`Between ${formatMoney(MIN[method])} and ${formatMoney(MAX)} per top-up.`}
          editable={!topUp.isPending}
          autoFocus
        />
      </Card>
      {method === "khalti" && (
        <Banner
          tone="info"
          title="Khalti sandbox test credentials"
          message={"Khalti ID: 9800000001   MPIN: 1111   OTP: 987654\nAfter paying, close the Khalti window to return here. We confirm the payment with Khalti before crediting your wallet."}
        />
      )}
      <Banner tone="info" message="Funds are minted to your on-chain wallet and appear in your balance once the transaction is confirmed." />
    </Screen>
  );
}
