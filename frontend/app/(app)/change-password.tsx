import { useRouter } from "expo-router";
import { useMe } from "@/apis/user";
import { PasswordResetFlow } from "@/components/auth/PasswordResetFlow";
import { AppBar, Card, Screen, Text, toast } from "@/components/ui";
import { useTheme } from "@/theme";
import { goBack } from "@/lib/navigation";

export default function ChangePassword() {
  const t = useTheme();
  const router = useRouter();
  const { data: me } = useMe();

  return (
    <Screen appBar={<AppBar title="Change password" fallback="/account" />} width="narrow">
      <Text variant="body" tone="muted">
        {"For your security we'll confirm it's you with a one-time code sent to your email."}
      </Text>
      <Card style={{ gap: t.space.lg }}>
        {me && (
          <PasswordResetFlow
            initialEmail={me.email}
            lockEmail
            onDone={() => {
              toast.success("Password updated", "Use your new password next time you sign in.");
              goBack(router, "/account");
            }}
          />
        )}
      </Card>
    </Screen>
  );
}
