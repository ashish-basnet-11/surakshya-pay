import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordResetFlow, ResetStep } from "@/components/auth/PasswordResetFlow";
import { Text, toast } from "@/components/ui";
import { useTheme } from "@/theme";

const copy: Record<ResetStep, { title: string; description: string }> = {
  email: { title: "Reset your password", description: "Enter the email you signed up with and we'll send you a verification code." },
  code: { title: "Check your email", description: "Enter the code to confirm it's you." },
  password: { title: "Choose a new password", description: "You'll use it the next time you sign in." },
};

export default function ForgotPassword() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [step, setStep] = useState<ResetStep>("email");

  return (
    <AuthShell
      {...copy[step]}
      footer={
        <Text variant="small" tone="muted">
          Remembered it?{" "}
          <Link href="/login" replace style={{ color: t.colors.primary, fontWeight: "600" }}>
            Back to sign in
          </Link>
        </Text>
      }
    >
      <PasswordResetFlow
        initialEmail={params.email}
        onStepChange={setStep}
        onDone={() => {
          toast.success("Password updated", "Sign in with your new password.");
          router.replace("/login");
        }}
      />
    </AuthShell>
  );
}
