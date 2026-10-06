import { ReactNode, useState } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "@/theme";

const widths = { narrow: 480, default: 760, wide: 1160 } as const;

export interface ScreenProps {
  children: ReactNode;
  /** Fixed bar above the scroll area (stack screens). Without it the top safe area is padded here. */
  appBar?: ReactNode;
  /** Fixed action area pinned below the scroll area (e.g. a primary submit button). */
  footer?: ReactNode;
  /** Set false for screens that manage their own layout (camera, lists). */
  scroll?: boolean;
  width?: keyof typeof widths;
  /** Enables pull-to-refresh; the spinner shows until the returned promise settles. */
  onRefresh?: () => Promise<unknown>;
  /** Tab screens sit above the tab bar, which already accounts for the bottom inset. */
  insetBottom?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * The single layout primitive every route renders. It owns the one scroll container
 * for the page, so headers either scroll with content or are deliberately fixed above it,
 * and nothing is nested or clipped.
 */
export function Screen({
  children,
  appBar,
  footer,
  scroll = true,
  width = "default",
  onRefresh,
  insetBottom = true,
  contentStyle,
}: ScreenProps) {
  const t = useTheme();
  const s = useStyles();
  const insets = useSafeAreaInsets();
  // Only user-initiated refreshes drive the spinner (background refetches shouldn't flash it).
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };
  const bottomPad = (footer || !insetBottom ? 0 : insets.bottom) + t.space.xxxl;

  const inner = (
    <View style={[s.inner, { maxWidth: widths[width] }, !appBar && { paddingTop: insets.top + t.space.lg }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={s.root}>
      {appBar}
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {scroll ? (
          <ScrollView
            style={s.flex}
            contentContainerStyle={[s.scrollContent, { paddingBottom: bottomPad }]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.colors.primary} colors={[t.colors.primary]} /> : undefined
            }
          >
            {inner}
          </ScrollView>
        ) : (
          <View style={[s.flex, { paddingBottom: footer || !insetBottom ? 0 : insets.bottom }]}>{inner}</View>
        )}
        {footer && (
          <View style={[s.footer, { paddingBottom: insets.bottom + t.space.md }]}>
            <View style={[s.footerInner, { maxWidth: widths[width] }]}>{footer}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.bg },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: {
    flexGrow: 1,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: t.space.lg,
    paddingTop: t.space.lg,
    gap: t.space.xxl,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    backgroundColor: t.colors.surface,
    paddingTop: t.space.md,
    paddingHorizontal: t.space.lg,
  },
  footerInner: { width: "100%", alignSelf: "center", gap: t.space.sm },
}));
