import { Stack } from "expo-router";
import { useTheme } from "@/theme";

/** Tabs at the root; every other signed-in screen is pushed on top as a real stack screen. */
export default function AppLayout() {
  const t = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bg } }} />;
}
