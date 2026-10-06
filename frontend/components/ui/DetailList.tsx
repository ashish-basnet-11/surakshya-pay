import { ReactNode } from "react";
import { View } from "react-native";
import { makeStyles } from "@/theme";
import { Text } from "./Text";

export interface Detail {
  label: string;
  value?: ReactNode;
  /** Monospace for hashes and addresses. */
  mono?: boolean;
}

/** Label / value pairs; stacks vertically for long values. */
export function DetailList({ items }: { items: Detail[] }) {
  const s = useStyles();
  return (
    <View style={s.list}>
      {items.map((item, i) => (
        <View key={item.label} style={[s.row, i > 0 && s.border]}>
          <Text variant="small" tone="muted" style={s.label}>
            {item.label}
          </Text>
          <View style={s.valueWrap}>
            {typeof item.value === "string" || typeof item.value === "number" || item.value == null ? (
              <Text variant="small" weight="500" style={[s.value, item.mono && s.mono]} selectable>
                {item.value == null || item.value === "" ? "—" : item.value}
              </Text>
            ) : (
              item.value
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  list: {},
  row: { flexDirection: "row", flexWrap: "wrap", gap: t.space.sm, paddingVertical: t.space.md, alignItems: "flex-start" },
  border: { borderTopWidth: 1, borderTopColor: t.colors.border },
  label: { width: 140, flexShrink: 0 },
  valueWrap: { flex: 1, minWidth: 160, alignItems: "flex-end" },
  value: { textAlign: "right" },
  mono: { fontFamily: "monospace", fontSize: 12 },
}));
