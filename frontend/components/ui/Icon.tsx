import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { useTheme } from "@/theme";
import { Tone } from "./Text";

export type IconName = ComponentProps<typeof Ionicons>["name"];

const toneToken = {
  default: "text",
  muted: "textMuted",
  subtle: "textSubtle",
  primary: "primary",
  success: "success",
  danger: "danger",
  warning: "warning",
  info: "info",
  inverse: "textInverse",
} as const;

export function Icon({ name, size = 20, tone = "default", color }: { name: IconName; size?: number; tone?: Tone; color?: string }) {
  const t = useTheme();
  return <Ionicons name={name} size={size} color={color ?? t.colors[toneToken[tone]]} accessibilityElementsHidden importantForAccessibility="no" />;
}

/** Budgets store Ionicons names server-side; fall back if one is unknown. */
export function safeIconName(name?: string | null, fallback: IconName = "wallet-outline"): IconName {
  return name && name in Ionicons.glyphMap ? (name as IconName) : fallback;
}
