import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { DialogHost, ToastHost } from "@/components/ui";
import { queryClient } from "@/lib/query-client";
import { useAuthHydrated, useAuthStore } from "@/store/use-auth-store";
import { useTheme } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const t = useTheme();
  const hydrated = useAuthHydrated();
  const signedIn = useAuthStore((s) => !!s.accessToken);
  const isAdmin = useAuthStore((s) => !!s.user?.is_superuser);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  const navTheme = useMemo(() => {
    const base = t.scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: { ...base.colors, primary: t.colors.primary, background: t.colors.bg, card: t.colors.surface, text: t.colors.text, border: t.colors.border },
    };
  }, [t]);

  // Wait for the persisted session so we never flash the login screen for a signed-in user.
  if (!hydrated) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navTheme}>
        <StatusBar style={t.scheme === "dark" ? "light" : "dark"} />
        {/* Guards decide which group exists; flipping a guard (sign in/out) redirects automatically. */}
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bg } }}>
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Protected guard={signedIn && !isAdmin}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
          <Stack.Protected guard={signedIn && isAdmin}>
            <Stack.Screen name="admin" />
          </Stack.Protected>
          <Stack.Screen name="+not-found" />
        </Stack>
        <DialogHost />
        <ToastHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
