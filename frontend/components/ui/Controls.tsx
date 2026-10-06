import { Pressable, ScrollView, Switch as RNSwitch, SwitchProps, View } from "react-native";
import { makeStyles, useTheme } from "@/theme";
import { InteractionState } from "./Button";
import { Icon, IconName } from "./Icon";
import { Text } from "./Text";

export interface Option<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

/** Mutually exclusive tabs / filters. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}) {
  const s = useStyles();
  return (
    <View style={s.segmented} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            style={(state) => {
              const { hovered, focused } = state as InteractionState;
              return [s.segment, selected && s.segmentSelected, !selected && hovered && s.segmentHover, focused && s.focused];
            }}
          >
            {o.icon && <Icon name={o.icon} size={16} tone={selected ? "default" : "muted"} />}
            <Text variant="smallStrong" tone={selected ? "default" : "muted"} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ label, selected, onPress, icon, color }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; color?: string }) {
  const t = useTheme();
  const s = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      style={(state) => {
        const { pressed, hovered, focused } = state as InteractionState;
        return [s.chip, selected && s.chipSelected, !selected && (hovered || pressed) && s.chipHover, focused && s.focused];
      }}
    >
      {color && <View style={[s.dot, { backgroundColor: color }]} />}
      {icon && <Icon name={icon} size={15} color={selected ? t.colors.primary : t.colors.textMuted} />}
      <Text variant="smallStrong" color={selected ? t.colors.primary : t.colors.text} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Horizontal chip row that scrolls instead of overflowing on narrow screens. */
export function ChipRow({ children, wrap }: { children: React.ReactNode; wrap?: boolean }) {
  const s = useStyles();
  if (wrap) return <View style={s.chipWrap}>{children}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipScroll}>
      {children}
    </ScrollView>
  );
}

export function Switch(props: SwitchProps) {
  const t = useTheme();
  return (
    <RNSwitch
      trackColor={{ false: t.colors.borderStrong, true: t.colors.primary }}
      thumbColor="#FFFFFF"
      {...({ activeThumbColor: "#FFFFFF" } as object)}
      {...props}
    />
  );
}

export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height / 2, backgroundColor: t.colors.surfaceMuted, overflow: "hidden" }}
    >
      <View style={{ width: `${pct * 100}%`, height: "100%", borderRadius: height / 2, backgroundColor: color ?? t.colors.primary }} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  segmented: {
    flexDirection: "row",
    padding: 3,
    gap: 2,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surfaceMuted,
    alignSelf: "stretch",
  },
  segment: {
    flex: 1,
    minHeight: 36,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: t.space.sm,
    borderRadius: t.radius.sm + 1,
    cursor: "pointer",
  },
  segmentSelected: { backgroundColor: t.colors.surface, boxShadow: t.shadow.sm },
  segmentHover: { backgroundColor: t.colors.surfaceHover },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: t.space.md,
    borderRadius: t.radius.full,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    cursor: "pointer",
  },
  chipSelected: { borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft },
  chipHover: { backgroundColor: t.colors.surfaceHover },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: t.space.sm },
  chipScroll: { gap: t.space.sm, paddingRight: t.space.lg },
}));
