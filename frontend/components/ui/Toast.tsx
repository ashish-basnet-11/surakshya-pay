import FlashMessage, { showMessage } from "react-native-flash-message";
import { useTheme } from "@/theme";
import { getErrorMessage } from "@/lib/api";

const base = { duration: 3200, floating: true, titleStyle: { fontWeight: "600" as const, fontSize: 15 } };

export const toast = {
  success: (message: string, description?: string) => showMessage({ ...base, message, description, type: "success" }),
  info: (message: string, description?: string) => showMessage({ ...base, message, description, type: "info" }),
  error: (error: unknown, fallback?: string) =>
    showMessage({ ...base, message: typeof error === "string" ? error : getErrorMessage(error, fallback), type: "danger", duration: 4500 }),
};

export function ToastHost() {
  const t = useTheme();
  return (
    <FlashMessage
      position="top"
      statusBarHeight={8}
      style={{ borderRadius: t.radius.md, maxWidth: 520, alignSelf: "center", width: "92%" }}
    />
  );
}
