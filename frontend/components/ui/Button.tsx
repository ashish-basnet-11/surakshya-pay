import { ActivityIndicator, Pressable, PressableProps, StyleProp, View, ViewStyle } from "react-native";
import { makeStyles, Theme, useTheme } from "@/theme";
import { Icon, IconName } from "./Icon";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  title: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Pressable state on web also carries hovered/focused. */
export type InteractionState = { pressed: boolean; hovered?: boolean; focused?: boolean };

function colorsFor(t: Theme, variant: Variant) {
  const c = t.colors;
  switch (variant) {
    case "primary":
      return { bg: c.primary, bgActive: c.primaryPressed, fg: c.onPrimary, border: c.primary };
    case "danger":
      return { bg: c.danger, bgActive: c.danger, fg: "#FFFFFF", border: c.danger };
    case "soft":
      return { bg: c.primarySoft, bgActive: c.primarySoft, fg: c.primary, border: c.primarySoft };
    case "secondary":
      return { bg: c.surface, bgActive: c.surfaceMuted, fg: c.text, border: c.borderStrong };
    case "ghost":
      return { bg: "transparent", bgActive: c.surfaceMuted, fg: c.primary, border: "transparent" };
  }
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading,
  disabled,
  fullWidth,
  style,
  ...rest
}: ButtonProps) {
  const t = useTheme();
  const s = useStyles();
  const c = colorsFor(t, variant);
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      {...rest}
      style={(state) => {
        const { pressed, hovered, focused } = state as InteractionState;
        return [
          s.base,
          s[size],
          { backgroundColor: pressed || hovered ? c.bgActive : c.bg, borderColor: c.border },
          variant === "primary" && hovered && !pressed && { opacity: 0.94 },
          pressed && { transform: [{ scale: 0.985 }] },
          focused && s.focused,
          inactive && s.disabled,
          fullWidth && s.fullWidth,
          style,
        ];
      }}
    >
      <View style={[s.content, loading && s.hidden]}>
        {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} color={c.fg} />}
        <Text variant={size === "sm" ? "smallStrong" : "bodyStrong"} color={c.fg} numberOfLines={1}>
          {title}
        </Text>
        {iconRight && <Icon name={iconRight} size={size === "sm" ? 16 : 18} color={c.fg} />}
      </View>
      {loading && <ActivityIndicator style={s.spinner} color={c.fg} />}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    borderWidth: 1,
    borderRadius: t.radius.md,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    cursor: "pointer",
  },
  sm: { minHeight: 36, paddingHorizontal: t.space.md },
  md: { minHeight: 46, paddingHorizontal: t.space.lg },
  lg: { minHeight: 52, paddingHorizontal: t.space.xl },
  content: { flexDirection: "row", alignItems: "center", gap: t.space.sm },
  hidden: { opacity: 0 },
  spinner: { position: "absolute" },
  fullWidth: { alignSelf: "stretch" },
  disabled: { opacity: 0.5, cursor: "auto" },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid", outlineOffset: 2 },
}));
