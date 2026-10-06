import { Platform } from "react-native";

const palette = {
  light: {
    bg: "#F5F6F8",
    surface: "#FFFFFF",
    surfaceMuted: "#F0F2F5",
    surfaceHover: "#F7F8FA",
    border: "#E2E5EA",
    borderStrong: "#C9CED6",
    text: "#0F172A",
    textMuted: "#556074",
    textSubtle: "#7D8798",
    textInverse: "#FFFFFF",
    primary: "#4F46E5",
    primaryPressed: "#4338CA",
    primarySoft: "#EEEFFE",
    onPrimary: "#FFFFFF",
    success: "#15803D",
    successSoft: "#E7F6EC",
    danger: "#C62828",
    dangerSoft: "#FDECEC",
    warning: "#B45309",
    warningSoft: "#FEF3E2",
    info: "#1D4ED8",
    infoSoft: "#E8EFFD",
    overlay: "rgba(15, 23, 42, 0.45)",
    focus: "#818CF8",
    hero: "#111827",
    heroText: "#FFFFFF",
    heroMuted: "#A5ADBD",
  },
  dark: {
    bg: "#0B0D12",
    surface: "#14171E",
    surfaceMuted: "#1B1F28",
    surfaceHover: "#1F2430",
    border: "#262B36",
    borderStrong: "#363C4A",
    text: "#F1F3F7",
    textMuted: "#A6AEBD",
    textSubtle: "#7A8394",
    textInverse: "#0B0D12",
    primary: "#6D72F6",
    primaryPressed: "#5B60EA",
    primarySoft: "#22254A",
    onPrimary: "#FFFFFF",
    success: "#4ADE80",
    successSoft: "#14291D",
    danger: "#F87171",
    dangerSoft: "#2E1717",
    warning: "#FBBF24",
    warningSoft: "#2E2410",
    info: "#60A5FA",
    infoSoft: "#13213A",
    overlay: "rgba(0, 0, 0, 0.6)",
    focus: "#A5B4FC",
    hero: "#1E2142",
    heroText: "#FFFFFF",
    heroMuted: "#9AA3B4",
  },
};

export type ColorToken = keyof typeof palette.light;

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 } as const;

const fontFamily = Platform.select({
  web: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  default: undefined,
});

export const type = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "700", letterSpacing: -0.6 },
  h1: { fontSize: 24, lineHeight: 32, fontWeight: "700", letterSpacing: -0.4 },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: "600", letterSpacing: -0.2 },
  h3: { fontSize: 17, lineHeight: 24, fontWeight: "600" },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: "600" },
  small: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  smallStrong: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
  overline: { fontSize: 11, lineHeight: 16, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" },
} as const;

export type TypeVariant = keyof typeof type;

function build(scheme: "light" | "dark") {
  const c = palette[scheme];
  return {
    scheme,
    colors: c,
    space,
    radius,
    type,
    fontFamily,
    shadow: {
      sm: scheme === "light" ? "0px 1px 2px rgba(15, 23, 42, 0.06)" : "0px 1px 2px rgba(0, 0, 0, 0.4)",
      md: scheme === "light" ? "0px 6px 24px rgba(15, 23, 42, 0.08)" : "0px 6px 24px rgba(0, 0, 0, 0.45)",
    },
  };
}

export const themes = { light: build("light"), dark: build("dark") };
export type Theme = typeof themes.light;
