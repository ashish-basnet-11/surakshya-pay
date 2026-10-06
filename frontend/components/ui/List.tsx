import { Children, isValidElement, ReactNode } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { makeStyles, useTheme } from "@/theme";
import { InteractionState } from "./Button";
import { Icon, IconName } from "./Icon";
import { Text, Tone } from "./Text";

/** A bordered group of rows separated by hairlines (settings, details). */
export function ListGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const s = useStyles();
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[s.group, style]}>
      {rows.map((row, i) => (
        <View key={row.key ?? i}>
          {i > 0 && <View style={s.separator} />}
          {row}
        </View>
      ))}
    </View>
  );
}

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconTone?: Tone;
  /** Short value shown on the right (e.g. current setting). */
  value?: string;
  /** Custom right-side element (switch, badge). */
  trailing?: ReactNode;
  leading?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  disabled?: boolean;
}

export function ListRow({
  title,
  subtitle,
  icon,
  iconTone = "primary",
  value,
  trailing,
  leading,
  onPress,
  destructive,
  showChevron = !!onPress,
  disabled,
}: ListRowProps) {
  const t = useTheme();
  const s = useStyles();
  const tone: Tone = destructive ? "danger" : "default";
  const softBg = {
    primary: t.colors.primarySoft,
    success: t.colors.successSoft,
    danger: t.colors.dangerSoft,
    warning: t.colors.warningSoft,
    info: t.colors.infoSoft,
  }[iconTone as "primary"] ?? t.colors.surfaceMuted;

  const content = (
    <>
      {leading ??
        (icon && (
          <View style={[s.iconWrap, { backgroundColor: destructive ? t.colors.dangerSoft : softBg }]}>
            <Icon name={icon} size={18} tone={destructive ? "danger" : iconTone} />
          </View>
        ))}
      <View style={s.body}>
        <Text variant="bodyStrong" tone={tone} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="small" tone="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && (
        <Text variant="small" tone="muted" numberOfLines={1} style={s.value}>
          {value}
        </Text>
      )}
      {trailing}
      {showChevron && <Icon name="chevron-forward" size={18} tone="subtle" />}
    </>
  );

  if (!onPress) return <View style={s.row}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={[title, value].filter(Boolean).join(", ")}
      style={(state) => {
        const { pressed, hovered, focused } = state as InteractionState;
        return [s.row, s.pressable, (pressed || hovered) && s.active, focused && s.focused, disabled && s.disabled];
      }}
    >
      {content}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  group: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: "hidden",
  },
  separator: { height: 1, backgroundColor: t.colors.border, marginLeft: t.space.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.md,
    minHeight: 60,
    paddingHorizontal: t.space.lg,
    paddingVertical: t.space.md,
  },
  pressable: { cursor: "pointer" },
  active: { backgroundColor: t.colors.surfaceHover },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid", outlineOffset: -2 },
  disabled: { opacity: 0.5 },
  iconWrap: { width: 36, height: 36, borderRadius: t.radius.sm + 2, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0, gap: 2 },
  value: { maxWidth: "45%" },
}));
