import { Stack } from "expo-router";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, IconName, Text } from "@/components/ui";
import { makeStyles, useBreakpoint } from "@/theme";

const points: { icon: IconName; title: string; text: string }[] = [
  { icon: "finger-print-outline", title: "Zero-knowledge sign in", text: "No password is stored. Sign-in is checked with a zero-knowledge proof." },
  { icon: "link-outline", title: "On-chain ledger", text: "Every transfer is recorded on the blockchain." },
  { icon: "shield-checkmark-outline", title: "Verified identities", text: "KYC keeps every wallet accountable." },
];

export function BrandMark({ inverse }: { inverse?: boolean }) {
  const s = useStyles();
  return (
    <View style={s.brand}>
      <View style={s.brandIcon}>
        <Icon name="shield-checkmark" size={18} color="#FFFFFF" />
      </View>
      <Text variant="h3" color={inverse ? "#FFFFFF" : undefined}>
        SurakshyaPay
      </Text>
    </View>
  );
}

interface AuthShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Shown above the title, e.g. a back link. */
  top?: ReactNode;
}

/**
 * Layout for every signed-out screen. The whole page is one ScrollView, so the brand
 * header scrolls with the form instead of staying pinned while only the form moves.
 */
export function AuthShell({ title, description, children, footer, top }: AuthShellProps) {
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();

  const form = (
    <ScrollView
      style={s.flex}
      contentContainerStyle={[s.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={s.column}>
        {!isDesktop && <BrandMark />}
        {top}
        <View style={s.heading}>
          <Text variant="h1" accessibilityRole="header">
            {title}
          </Text>
          {description && (
            <Text variant="body" tone="muted">
              {description}
            </Text>
          )}
        </View>
        {children}
        {footer && <View style={s.footer}>{footer}</View>}
      </View>
    </ScrollView>
  );

  return (
    <View style={s.root}>
      <Stack.Screen options={{ title }} />
      {isDesktop && (
        <View style={[s.hero, { paddingTop: insets.top + 40 }]}>
          <BrandMark inverse />
          <View style={s.heroBody}>
            <Text variant="display" color="#FFFFFF">
              Payments you can verify.
            </Text>
            <Text variant="body" color="#A5ADBD" style={s.heroLead}>
              Send, receive and budget with a wallet secured by zero-knowledge proofs and a public ledger.
            </Text>
            <View style={s.points}>
              {points.map((p) => (
                <View key={p.title} style={s.point}>
                  <View style={s.pointIcon}>
                    <Icon name={p.icon} size={18} color="#C7CBFF" />
                  </View>
                  <View style={s.flex}>
                    <Text variant="bodyStrong" color="#FFFFFF">
                      {p.title}
                    </Text>
                    <Text variant="small" color="#A5ADBD">
                      {p.text}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <Text variant="caption" color="#7D8798">
            © {new Date().getFullYear()} SurakshyaPay
          </Text>
        </View>
      )}
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {form}
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, flexDirection: "row", backgroundColor: t.colors.surface },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: t.space.xl },
  column: { width: "100%", maxWidth: 420, alignSelf: "center", gap: t.space.xxl },
  heading: { gap: t.space.xs },
  footer: { alignItems: "center", gap: t.space.sm },
  brand: { flexDirection: "row", alignItems: "center", gap: t.space.sm },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: t.radius.sm,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    width: "42%",
    maxWidth: 560,
    backgroundColor: "#111827",
    paddingHorizontal: 48,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  heroBody: { gap: t.space.lg, maxWidth: 420 },
  heroLead: { marginBottom: t.space.lg },
  points: { gap: t.space.xl },
  point: { flexDirection: "row", gap: t.space.md, alignItems: "flex-start" },
  pointIcon: {
    width: 36,
    height: 36,
    borderRadius: t.radius.sm + 2,
    backgroundColor: "rgba(129, 140, 248, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
}));
