import { ReactNode } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { makeStyles } from "@/theme";
import { InteractionState } from "./Button";

interface CardProps {
  children: ReactNode;
  padded?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, padded = true, onPress, accessibilityLabel, style }: CardProps) {
  const s = useStyles();
  if (!onPress) return <View style={[s.card, padded && s.padded, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={(state) => {
        const { pressed, hovered, focused } = state as InteractionState;
        return [s.card, padded && s.padded, s.pressable, (hovered || pressed) && s.hovered, focused && s.focused, style];
      }}
    >
      {children}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    boxShadow: t.shadow.sm,
    overflow: "hidden",
  },
  padded: { padding: t.space.lg },
  pressable: { cursor: "pointer" },
  hovered: { borderColor: t.colors.borderStrong, backgroundColor: t.colors.surfaceHover },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid" },
}));
