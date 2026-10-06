import { ReactNode } from "react";
import { View } from "react-native";
import { getErrorMessage } from "@/lib/api";
import { makeStyles, useTheme } from "@/theme";
import { Button } from "./Button";
import { Icon, IconName } from "./Icon";
import { Text } from "./Text";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon = "file-tray-outline", title, message, action, compact }: EmptyStateProps) {
  const t = useTheme();
  const s = useStyles();
  return (
    <View style={[s.wrap, compact && s.compact]}>
      <View style={[s.iconWrap, { backgroundColor: t.colors.surfaceMuted }]}>
        <Icon name={icon} size={24} tone="muted" />
      </View>
      <Text variant="bodyStrong" align="center">
        {title}
      </Text>
      {message && (
        <Text variant="small" tone="muted" align="center" style={s.message}>
          {message}
        </Text>
      )}
      {action && <View style={s.action}>{action}</View>}
    </View>
  );
}

export function ErrorState({ error, onRetry, title = "Couldn't load this", compact }: { error: unknown; onRetry?: () => void; title?: string; compact?: boolean }) {
  const t = useTheme();
  const s = useStyles();
  return (
    <View style={[s.wrap, compact && s.compact]} accessibilityRole="alert">
      <View style={[s.iconWrap, { backgroundColor: t.colors.dangerSoft }]}>
        <Icon name="cloud-offline-outline" size={24} tone="danger" />
      </View>
      <Text variant="bodyStrong" align="center">
        {title}
      </Text>
      <Text variant="small" tone="muted" align="center" style={s.message}>
        {getErrorMessage(error)}
      </Text>
      {onRetry && (
        <View style={s.action}>
          <Button title="Try again" icon="refresh" variant="secondary" size="sm" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: t.space.sm,
    paddingVertical: t.space.huge,
    paddingHorizontal: t.space.xl,
  },
  compact: { paddingVertical: t.space.xxl },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: t.space.xs },
  message: { maxWidth: 360 },
  action: { marginTop: t.space.sm },
}));
