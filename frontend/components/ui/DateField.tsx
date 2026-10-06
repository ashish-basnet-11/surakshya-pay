import DateTimePicker from "@react-native-community/datetimepicker";
import { createElement, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { formatDate } from "@/lib/format";
import { makeStyles, useTheme } from "@/theme";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Text } from "./Text";

interface DateFieldProps {
  label: string;
  /** YYYY-MM-DD or empty */
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
  min?: string;
  max?: string;
  placeholder?: string;
}

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromISODate = (v: string) => {
  const [y, m, d] = v.split("-").map(Number);
  return y ? new Date(y, m - 1, d) : new Date();
};

/** Native date input on web, platform picker on iOS/Android. */
export function DateField({ label, value, onChange, error, hint, min, max, placeholder = "Select a date" }: DateFieldProps) {
  const t = useTheme();
  const s = useStyles();
  const [open, setOpen] = useState(false);

  const message = error ? (
    <Text variant="small" tone="danger">
      {error}
    </Text>
  ) : hint ? (
    <Text variant="small" tone="subtle">
      {hint}
    </Text>
  ) : null;

  if (Platform.OS === "web") {
    return (
      <View style={s.container}>
        <Text variant="smallStrong">{label}</Text>
        {createElement("input", {
          type: "date",
          value,
          min,
          max,
          "aria-label": label,
          "aria-invalid": !!error,
          onChange: (e: { target: { value: string } }) => onChange(e.target.value),
          style: {
            height: 48,
            padding: "0 14px",
            borderRadius: t.radius.md,
            border: `1px solid ${error ? t.colors.danger : t.colors.borderStrong}`,
            background: t.colors.surface,
            color: t.colors.text,
            fontSize: 15,
            fontFamily: "inherit",
            colorScheme: t.scheme,
            boxSizing: "border-box",
            width: "100%",
          },
        })}
        {message}
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text variant="smallStrong">{label}</Text>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatDate(value) : placeholder}`}
        style={[s.field, !!error && s.errored]}
      >
        <Icon name="calendar-outline" size={18} tone="subtle" />
        <Text variant="body" tone={value ? "default" : "subtle"} style={s.flex}>
          {value ? formatDate(value) : placeholder}
        </Text>
        {value ? null : <Icon name="chevron-down" size={18} tone="subtle" />}
      </Pressable>
      {open && (
        <View style={Platform.OS === "ios" ? s.iosPicker : undefined}>
          <DateTimePicker
            value={value ? fromISODate(value) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            minimumDate={min ? fromISODate(min) : undefined}
            maximumDate={max ? fromISODate(max) : undefined}
            onChange={(event, date) => {
              if (Platform.OS === "android") setOpen(false);
              if (event.type === "set" && date) onChange(toISODate(date));
            }}
          />
          {Platform.OS === "ios" && <Button title="Done" variant="ghost" onPress={() => setOpen(false)} style={s.done} />}
        </View>
      )}
      {message}
    </View>
  );
}

export { toISODate };

const useStyles = makeStyles((t) => ({
  container: { gap: t.space.xs + 2, alignSelf: "stretch" },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.sm,
    minHeight: 48,
    paddingHorizontal: t.space.md + 2,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.borderStrong,
    backgroundColor: t.colors.surface,
  },
  errored: { borderColor: t.colors.danger },
  flex: { flex: 1 },
  iosPicker: { borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
  done: { alignSelf: "flex-end" },
}));
