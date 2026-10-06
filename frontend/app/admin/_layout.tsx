import { Stack } from "expo-router";
import { useTheme } from "@/theme";

export default function AdminLayout() {
  const t = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bg } }} />;
}
