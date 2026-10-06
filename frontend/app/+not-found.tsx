import { Stack, useRouter } from "expo-router";
import { Button, EmptyState, Screen } from "@/components/ui";

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen width="narrow" contentStyle={{ justifyContent: "center" }}>
      <Stack.Screen options={{ title: "Page not found" }} />
      <EmptyState
        icon="compass-outline"
        title="This page doesn't exist"
        message="The link may be broken or the page may have moved."
        action={<Button title="Go to home" icon="home-outline" onPress={() => router.replace("/")} />}
      />
    </Screen>
  );
}
