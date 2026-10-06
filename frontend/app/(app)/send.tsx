import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useBudgetCategories } from "@/apis/budgets";
import { useTransfer } from "@/apis/transactions";
import { useMe } from "@/apis/user";
import { AppBar, Banner, Button, Card, Chip, ChipRow, dialog, IconButton, Screen, Section, Text, TextField, toast } from "@/components/ui";
import { AmountInput } from "@/components/wallet/AmountInput";
import { getErrorMessage } from "@/lib/api";
import { formatMoney, toNumber } from "@/lib/format";
import { parseAmount } from "@/lib/validation";
import { useTheme } from "@/theme";
import { goBack } from "@/lib/navigation";

export default function Send() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ to?: string }>();
  const me = useMe();
  const categories = useBudgetCategories();
  const transfer = useTransfer();
  const [to, setTo] = useState(params.to ?? "");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ to?: string; amount?: string }>({});

  const balance = toNumber(me.data?.balance);
  const recipient = to.trim().replace(/^@/, "");

  const submit = async () => {
    const value = parseAmount(amount, 0);
    const next = {
      to: !recipient ? "Enter the recipient's username." : recipient === me.data?.username ? "You can't send money to yourself." : undefined,
      amount: !amount ? "Enter an amount." : !(value > 0) ? "Enter a whole amount in NPR." : value > balance ? "That's more than your available balance." : undefined,
    };
    setErrors(next);
    if (next.to || next.amount) return;

    const ok = await dialog.confirm({
      title: `Send ${formatMoney(value)}?`,
      message: `To @${recipient}${category ? ` · ${category}` : ""}. Transfers are recorded on-chain and can't be reversed.`,
      confirmLabel: "Send now",
      icon: "paper-plane-outline",
    });
    if (!ok) return;

    transfer.mutate(
      { to_username: recipient, amount: value, category: category ?? undefined },
      {
        onSuccess: () => {
          toast.success("Money sent", `${formatMoney(value)} to @${recipient}`);
          goBack(router);
        },
      }
    );
  };

  return (
    <Screen
      appBar={
        <AppBar
          title="Send money"
          actions={<IconButton icon="scan-outline" label="Scan a QR code" onPress={() => router.push("/scan")} />}
        />
      }
      footer={<Button title="Review and send" size="lg" fullWidth icon="paper-plane-outline" loading={transfer.isPending} onPress={submit} />}
    >
      {transfer.error && <Banner tone="danger" title="Transfer failed" message={getErrorMessage(transfer.error)} />}

      <Card style={{ gap: t.space.lg }}>
        <TextField
          label="Recipient"
          icon="at"
          placeholder="username"
          value={to}
          onChangeText={(v) => {
            setTo(v);
            setErrors((e) => ({ ...e, to: undefined }));
          }}
          error={errors.to}
          autoCapitalize="none"
          autoCorrect={false}
          hint="Ask them for their username, or scan their payment QR code."
          editable={!transfer.isPending}
          autoFocus={!params.to}
        />
        <AmountInput
          value={amount}
          onChange={(v) => {
            setAmount(v);
            setErrors((e) => ({ ...e, amount: undefined }));
          }}
          error={errors.amount}
          available={balance}
          editable={!transfer.isPending}
          autoFocus={!!params.to}
        />
      </Card>

      <Section title="Category" description="Optional. Tag the payment so it counts toward a matching budget.">
        {categories.data && categories.data.length > 0 ? (
          <ChipRow wrap>
            <Chip label="None" selected={category === null} onPress={() => setCategory(null)} />
            {categories.data.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </ChipRow>
        ) : (
          <View>
            <Text variant="small" tone="muted">
              {categories.isLoading ? "Loading your budget categories…" : "You don't have any budgets yet. Create one to track spending by category."}
            </Text>
          </View>
        )}
      </Section>
    </Screen>
  );
}
