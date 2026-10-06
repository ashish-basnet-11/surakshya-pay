import { StyleSheet, useColorScheme, useWindowDimensions } from "react-native";
import { usePreferences } from "@/store/use-preferences-store";
import { Theme, themes } from "./tokens";

export * from "./tokens";

export function useTheme(): Theme {
  const appearance = usePreferences((s) => s.appearance);
  const system = useColorScheme();
  const scheme = appearance === "system" ? (system === "dark" ? "dark" : "light") : appearance;
  return themes[scheme];
}

/** Theme-aware StyleSheet factory; styles are built once per theme. */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (t: Theme) => T) {
  const cache = new Map<Theme, T>();
  return function useStyles(): T {
    const t = useTheme();
    let styles = cache.get(t);
    if (!styles) {
      styles = StyleSheet.create(factory(t));
      cache.set(t, styles);
    }
    return styles;
  };
}

export const breakpoints = { tablet: 640, desktop: 1024, wide: 1280 } as const;

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    width,
    isPhone: width < breakpoints.tablet,
    isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
    isDesktop: width >= breakpoints.desktop,
    atLeastTablet: width >= breakpoints.tablet,
  };
}
