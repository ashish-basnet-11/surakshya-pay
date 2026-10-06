import { Modal, Pressable, View } from "react-native";
import { create } from "zustand";
import { makeStyles } from "@/theme";
import { Button } from "./Button";
import { Icon, IconName } from "./Icon";
import { Text } from "./Text";

interface DialogOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: IconName;
}

interface DialogState {
  current: (DialogOptions & { kind: "confirm" | "alert"; resolve: (ok: boolean) => void }) | null;
}

const useDialogStore = create<DialogState>(() => ({ current: null }));

function open(kind: "confirm" | "alert", options: DialogOptions) {
  return new Promise<boolean>((resolve) => {
    useDialogStore.setState({
      current: {
        ...options,
        kind,
        resolve: (ok) => {
          useDialogStore.setState({ current: null });
          resolve(ok);
        },
      },
    });
  });
}

/**
 * Promise-based dialogs that work identically on iOS, Android and web
 * (React Native's Alert.alert is a no-op in the browser).
 */
export const dialog = {
  confirm: (options: DialogOptions) => open("confirm", options),
  alert: (options: DialogOptions) => open("alert", options).then(() => undefined),
};

export function DialogHost() {
  const s = useStyles();
  const current = useDialogStore((st) => st.current);
  const close = (ok: boolean) => current?.resolve(ok);

  return (
    <Modal visible={!!current} transparent animationType="fade" onRequestClose={() => close(false)} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={() => close(false)} accessibilityLabel="Dismiss dialog" accessibilityRole="button" />
        {current && (
          <View style={s.panel} accessibilityViewIsModal accessibilityRole="alert">
            {current.icon && (
              <View style={[s.iconWrap, current.destructive && s.iconDanger]}>
                <Icon name={current.icon} size={22} tone={current.destructive ? "danger" : "primary"} />
              </View>
            )}
            <Text variant="h3">{current.title}</Text>
            {current.message && (
              <Text variant="body" tone="muted">
                {current.message}
              </Text>
            )}
            <View style={s.actions}>
              {current.kind === "confirm" && (
                <Button title={current.cancelLabel ?? "Cancel"} variant="secondary" onPress={() => close(false)} style={s.action} />
              )}
              <Button
                title={current.confirmLabel ?? (current.kind === "alert" ? "OK" : "Confirm")}
                variant={current.destructive ? "danger" : "primary"}
                onPress={() => close(true)}
                style={s.action}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", padding: t.space.xl },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: t.colors.overlay },
  panel: {
    width: "100%",
    maxWidth: 420,
    gap: t.space.sm,
    padding: t.space.xxl,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.surface,
    boxShadow: t.shadow.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.primarySoft,
    marginBottom: t.space.xs,
  },
  iconDanger: { backgroundColor: t.colors.dangerSoft },
  actions: { flexDirection: "row", gap: t.space.sm, marginTop: t.space.lg },
  action: { flex: 1, alignSelf: "stretch" },
}));
