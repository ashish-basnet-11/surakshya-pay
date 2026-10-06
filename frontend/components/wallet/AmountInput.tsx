import { View } from "react-native";
import { Chip, ChipRow, Text, TextField } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { sanitizeAmountInput } from "@/lib/validation";
import { useTheme } from "@/theme";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  quickAmounts?: number[];
  /** Shows "Available NPR x" and offers a "Max" chip. */
  available?: number;
  label?: string;
  hint?: string;
  editable?: boolean;
  autoFocus?: boolean;
}

export function AmountInput({ value, onChange, error, quickAmounts = [100, 500, 1000, 2000], available, label = "Amount", hint, editable = true, autoFocus }: AmountInputProps) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space.md }}>
      <TextField
        label={label}
        prefix="NPR"
        placeholder="0"
        inputSize="lg"
        keyboardType="number-pad"
        inputMode="numeric"
        value={value}
        onChangeText={(v) => onChange(sanitizeAmountInput(v, 0))}
        error={error}
        hint={hint}
        editable={editable}
        autoFocus={autoFocus}
      />
      <ChipRow>
        {quickAmounts.map((amt) => (
          <Chip key={amt} label={amt.toLocaleString("en-US")} selected={value === String(amt)} onPress={() => editable && onChange(String(amt))} />
        ))}
        {available !== undefined && Math.floor(available) > 0 && (
          <Chip label="Max" selected={value === String(Math.floor(available))} onPress={() => editable && onChange(String(Math.floor(available)))} />
        )}
      </ChipRow>
      {available !== undefined && (
        <Text variant="small" tone="muted">
          Available balance: <Text variant="smallStrong">{formatMoney(available)}</Text>
        </Text>
      )}
    </View>
  );
}
