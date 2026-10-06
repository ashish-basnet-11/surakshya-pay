import { Text as RNText, TextProps as RNTextProps, TextStyle } from "react-native";
import { ColorToken, TypeVariant, useTheme } from "@/theme";

export type Tone = "default" | "muted" | "subtle" | "primary" | "success" | "danger" | "warning" | "info" | "inverse";

const toneToken: Record<Tone, ColorToken> = {
  default: "text",
  muted: "textMuted",
  subtle: "textSubtle",
  primary: "primary",
  success: "success",
  danger: "danger",
  warning: "warning",
  info: "info",
  inverse: "textInverse",
};

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: Tone;
  color?: string;
  align?: TextStyle["textAlign"];
  weight?: TextStyle["fontWeight"];
  tabular?: boolean;
}

export function Text({ variant = "body", tone = "default", color, align, weight, tabular, style, ...rest }: TextProps) {
  const t = useTheme();
  return (
    <RNText
      {...rest}
      style={[
        t.type[variant] as TextStyle,
        { color: color ?? t.colors[toneToken[tone]], fontFamily: t.fontFamily },
        align && { textAlign: align },
        weight && { fontWeight: weight },
        tabular && { fontVariant: ["tabular-nums"] },
        style,
      ]}
    />
  );
}
