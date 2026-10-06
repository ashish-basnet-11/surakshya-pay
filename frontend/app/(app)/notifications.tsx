import { Fragment } from "react";
import { Pressable, View } from "react-native";
import { useMarkAllRead, useMarkRead, useNotifications } from "@/apis/notifications";
import { AppBar, Button, Card, EmptyState, Icon, IconName, InteractionState, QueryView, Screen, SkeletonRows, Text, toast } from "@/components/ui";
import { formatRelative } from "@/lib/format";
import { makeStyles, useTheme } from "@/theme";
import { Notification } from "@/types/notifications";

function iconFor(n: Notification): { icon: IconName; tone: "success" | "primary" | "warning" | "info" } {
  const text = `${n.title} ${n.message}`.toLowerCase();
  if (n.notification_type === "transaction") {
    if (text.includes("received") || text.includes("deposit") || text.includes("top")) return { icon: "arrow-down", tone: "success" };
    return { icon: "arrow-up", tone: "primary" };
  }
  if (text.includes("kyc") || text.includes("verif")) return { icon: "shield-checkmark-outline", tone: "info" };
  if (text.includes("budget")) return { icon: "wallet-outline", tone: "warning" };
  return { icon: "notifications-outline", tone: "info" };
}

export default function Notifications() {
  const t = useTheme();
  const s = useStyles();
  const query = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const unread = query.data?.filter((n) => !n.is_read).length ?? 0;

  return (
    <Screen
      appBar={
        <AppBar
          title="Notifications"
          subtitle={query.data ? (unread ? `${unread} unread` : "All caught up") : undefined}
          actions={
            unread > 0 ? (
              <Button
                title="Mark all read"
                variant="ghost"
                size="sm"
                loading={markAll.isPending}
                onPress={() => markAll.mutate(undefined, { onError: (e) => toast.error(e) })}
              />
            ) : undefined
          }
        />
      }
      onRefresh={() => query.refetch()}
    >
      <QueryView
        query={query}
        loading={<SkeletonRows count={6} />}
        isEmpty={(d) => d.length === 0}
        empty={
          <Card>
            <EmptyState icon="notifications-off-outline" title="No notifications" message="Payments, top-ups and verification updates will show up here." />
          </Card>
        }
      >
        {(items) => (
          <Card padded={false}>
            {items.map((n, i) => {
              const { icon, tone } = iconFor(n);
              const soft = { success: t.colors.successSoft, primary: t.colors.primarySoft, warning: t.colors.warningSoft, info: t.colors.infoSoft }[tone];
              return (
                <Fragment key={n.id}>
                  {i > 0 && <View style={s.sep} />}
                  <Pressable
                    onPress={() => !n.is_read && markRead.mutate(n.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${n.is_read ? "" : "Unread. "}${n.title}. ${n.message}`}
                    accessibilityHint={n.is_read ? undefined : "Marks as read"}
                    style={(state) => {
                      const { hovered, pressed, focused } = state as InteractionState;
                      return [s.row, !n.is_read && s.unread, (hovered || pressed) && s.hover, focused && s.focused];
                    }}
                  >
                    <View style={[s.icon, { backgroundColor: soft }]}>
                      <Icon name={icon} size={18} tone={tone} />
                    </View>
                    <View style={s.body}>
                      <View style={s.titleRow}>
                        <Text variant={n.is_read ? "body" : "bodyStrong"} style={s.flex} numberOfLines={2}>
                          {n.title}
                        </Text>
                        <Text variant="caption" tone="subtle">
                          {formatRelative(n.created_at)}
                        </Text>
                      </View>
                      <Text variant="small" tone="muted">
                        {n.message}
                      </Text>
                    </View>
                    {!n.is_read && <View style={s.dot} accessibilityElementsHidden />}
                  </Pressable>
                </Fragment>
              );
            })}
          </Card>
        )}
      </QueryView>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  sep: { height: 1, backgroundColor: t.colors.border },
  row: { flexDirection: "row", alignItems: "flex-start", gap: t.space.md, padding: t.space.lg, cursor: "pointer" },
  unread: { backgroundColor: t.colors.primarySoft + "66" },
  hover: { backgroundColor: t.colors.surfaceHover },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid", outlineOffset: -2 },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0, gap: 2 },
  titleRow: { flexDirection: "row", gap: t.space.sm, alignItems: "flex-start" },
  flex: { flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.primary, marginTop: 6 },
}));
