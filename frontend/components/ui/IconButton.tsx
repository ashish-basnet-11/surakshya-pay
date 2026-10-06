import { Pressable, PressableProps, StyleProp, View, ViewStyle } from "react-native";
import { makeStyles, useTheme } from "@/theme";
import { InteractionState } from "./Button";
import { Icon, IconName } from "./Icon";
import { Text } from "./Text";

interface IconButtonProps extends Omit<PressableProps, "style"> {
  icon: IconName;
  /** Required: icon-only controls need a spoken name. */
  label: string;
  variant?: "plain" | "outline" | "filled" | "hero";
  size?: number;
  badge?: number;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({ icon, label, variant = "plain", size = 40, badge, style, ...rest }: IconButtonProps) {
  const t = useTheme();
  const s = useStyles();
  const fg = variant === "hero" ? t.colors.heroText : variant === "filled" ? t.colors.onPrimary : t.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} unread` : label}
      hitSlop={6}
      {...rest}
      style={(state) => {
        const { pressed, hovered, focused } = state as InteractionState;
        return [
          s.base,
          { width: size, height: size, borderRadius: size / 2 },
          s[variant],
          (pressed || hovered) && s[`${variant}Active`],
          focused && s.focused,
          rest.disabled && { opacity: 0.5 },
          style,
        ];
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} color={fg} />
      {!!badge && badge > 0 && (
        <View style={s.badge}>
          <Text variant="caption" color={t.colors.onPrimary} style={s.badgeText}>
            {badge > 9 ? "9+" : badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: { alignItems: "center", justifyContent: "center", cursor: "pointer" },
  plain: {},
  plainActive: { backgroundColor: t.colors.surfaceMuted },
  outline: { borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
  outlineActive: { backgroundColor: t.colors.surfaceHover },
  filled: { backgroundColor: t.colors.primary },
  filledActive: { backgroundColor: t.colors.primaryPressed },
  hero: { backgroundColor: "rgba(255,255,255,0.12)" },
  heroActive: { backgroundColor: "rgba(255,255,255,0.2)" },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid" },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: t.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 10, lineHeight: 12, fontWeight: "700" },
}));
