import { useState } from "react";
import { Pressable, View } from "react-native";
import {
  Banner,
  Button,
  Card,
  Chip,
  ChipRow,
  DateField,
  Icon,
  safeIconName,
  InteractionState,
  SegmentedControl,
  Text,
  TextField,
  toISODate,
} from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { parseAmount, sanitizeAmountInput } from "@/lib/validation";
import { makeStyles, useBreakpoint, useTheme } from "@/theme";
import { BudgetInput, BudgetType } from "@/types/budget";
import { budgetColors, budgetIcons, categoryPresets } from "./presets";

type Errors = Partial<Record<"name" | "category" | "amount" | "start" | "end", string>>;

interface BudgetFormProps {
  initial?: Partial<BudgetInput>;
  submitLabel: string;
  loading?: boolean;
  error?: unknown;
  onSubmit: (input: BudgetInput) => void;
  onCancel?: () => void;
}

export function BudgetForm({ initial, submitLabel, loading, error, onSubmit, onCancel }: BudgetFormProps) {
  const t = useTheme();
  const s = useStyles();
  const { atLeastTablet } = useBreakpoint();
  const [type, setType] = useState<BudgetType>(initial?.budget_type ?? "expense");
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [amount, setAmount] = useState(initial?.budget_amount ? String(initial.budget_amount) : "");
  const [color, setColor] = useState(initial?.color ?? budgetColors[0]);
  const [icon, setIcon] = useState<string>(initial?.icon ?? "wallet");
  const [start, setStart] = useState(initial?.start_date ?? toISODate(new Date()));
  const [end, setEnd] = useState(initial?.end_date ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [errors, setErrors] = useState<Errors>({});

  const presets = categoryPresets[type];
  const isPreset = presets.some((p) => p.value === category);

  const pickPreset = (value: string) => {
    const preset = presets.find((p) => p.value === value);
    setCategory(value);
    if (preset) {
      setColor(preset.color);
      setIcon(preset.icon);
      if (!name.trim()) setName(type === "expense" ? `${value} budget` : value);
    }
    setErrors((e) => ({ ...e, category: undefined }));
  };

  const submit = () => {
    const value = parseAmount(amount);
    const next: Errors = {
      name: name.trim() ? undefined : "Give it a name.",
      category: category.trim() ? undefined : "Pick or type a category.",
      amount: !amount ? "Enter an amount." : !(value > 0) ? "Enter a valid amount greater than 0." : undefined,
      start: start ? undefined : "Choose a start date.",
      end: end && end < start ? "End date must be after the start date." : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    onSubmit({
      name: name.trim(),
      category: category.trim(),
      budget_amount: value,
      budget_type: type,
      color,
      icon,
      start_date: start,
      end_date: end || null,
      description: description.trim() || null,
    });
  };

  return (
    <View style={s.form}>
      {!!error && <Banner tone="danger" title="Couldn't save" message={getErrorMessage(error)} />}

      <Card style={s.card}>
        <Text variant="h3">What is it for?</Text>
        <SegmentedControl
          accessibilityLabel="Budget type"
          value={type}
          onChange={(v) => {
            setType(v);
            if (isPreset) setCategory("");
          }}
          options={[
            { value: "expense", label: "Spending" },
            { value: "savings", label: "Savings" },
            { value: "investment", label: "Investing" },
          ]}
        />
        <Text variant="small" tone="muted">
          {type === "expense"
            ? "Set a limit. Payments you tag with this category count against it."
            : "Set a target and track progress toward it."}
        </Text>
        <View style={s.field}>
          <Text variant="smallStrong">Category</Text>
          <ChipRow wrap>
            {presets.map((p) => (
              <Chip key={p.value} label={p.value} icon={p.icon} selected={category === p.value} onPress={() => pickPreset(p.value)} />
            ))}
          </ChipRow>
          <TextField
            placeholder="Or type your own category"
            value={isPreset ? "" : category}
            onChangeText={(v) => {
              setCategory(v);
              setErrors((e) => ({ ...e, category: undefined }));
            }}
            error={errors.category}
            maxLength={100}
          />
        </View>
      </Card>

      <Card style={s.card}>
        <Text variant="h3">Details</Text>
        <TextField
          label="Name"
          placeholder={type === "expense" ? "e.g. Groceries this month" : "e.g. Trip to Pokhara"}
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErrors((e) => ({ ...e, name: undefined }));
          }}
          error={errors.name}
          maxLength={255}
        />
        <TextField
          label={type === "expense" ? "Spending limit" : "Target amount"}
          prefix="NPR"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={(v) => {
            setAmount(sanitizeAmountInput(v));
            setErrors((e) => ({ ...e, amount: undefined }));
          }}
          error={errors.amount}
        />
        <View style={[s.row, atLeastTablet && s.rowWide]}>
          <View style={s.flex}>
            <DateField label="Starts" value={start} onChange={setStart} error={errors.start} />
          </View>
          <View style={s.flex}>
            <DateField label="Ends (optional)" value={end} onChange={setEnd} min={start} error={errors.end} />
          </View>
        </View>
        <TextField label="Notes (optional)" placeholder="Anything to remember" value={description} onChangeText={setDescription} multiline />
      </Card>

      <Card style={s.card}>
        <Text variant="h3">Appearance</Text>
        <View style={s.preview}>
          <View style={[s.previewIcon, { backgroundColor: `${color}22` }]}>
            <Icon name={safeIconName(icon)} size={22} color={color} />
          </View>
          <Text variant="bodyStrong" numberOfLines={1} style={s.flex}>
            {name || "Your budget"}
          </Text>
        </View>
        <View style={s.field}>
          <Text variant="smallStrong">Colour</Text>
          <View style={s.swatches}>
            {budgetColors.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                accessibilityRole="radio"
                accessibilityState={{ checked: color === c }}
                accessibilityLabel={`Colour ${c}`}
                style={(state) => [s.swatch, { backgroundColor: c }, color === c && s.swatchSelected, (state as InteractionState).focused && s.focused]}
              >
                {color === c && <Icon name="checkmark" size={16} color="#FFFFFF" />}
              </Pressable>
            ))}
          </View>
        </View>
        <View style={s.field}>
          <Text variant="smallStrong">Icon</Text>
          <View style={s.swatches}>
            {budgetIcons.map((name) => (
              <Pressable
                key={name}
                onPress={() => setIcon(name)}
                accessibilityRole="radio"
                accessibilityState={{ checked: icon === name }}
                accessibilityLabel={`Icon ${name}`}
                style={(state) => [s.iconOption, icon === name && { borderColor: color, backgroundColor: `${color}1A` }, (state as InteractionState).focused && s.focused]}
              >
                <Icon name={name} size={18} color={icon === name ? color : t.colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>
      </Card>

      <View style={[s.actions, atLeastTablet && s.actionsWide]}>
        {onCancel && <Button title="Cancel" variant="secondary" size="lg" onPress={onCancel} disabled={loading} style={atLeastTablet ? undefined : s.stretch} />}
        <Button title={submitLabel} size="lg" loading={loading} onPress={submit} style={atLeastTablet ? undefined : s.stretch} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  form: { gap: t.space.lg },
  card: { gap: t.space.lg },
  field: { gap: t.space.sm },
  row: { gap: t.space.lg },
  rowWide: { flexDirection: "row" },
  flex: { flex: 1 },
  preview: { flexDirection: "row", alignItems: "center", gap: t.space.md },
  previewIcon: { width: 44, height: 44, borderRadius: t.radius.md, alignItems: "center", justifyContent: "center" },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: t.space.sm },
  swatch: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", cursor: "pointer" },
  swatchSelected: { borderWidth: 3, borderColor: t.colors.surface, boxShadow: `0px 0px 0px 2px ${t.colors.text}` },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid" },
  actions: { gap: t.space.sm },
  actionsWide: { flexDirection: "row", justifyContent: "flex-end" },
  stretch: { alignSelf: "stretch" },
}));
