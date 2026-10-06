import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRequestPasswordReset, useResetPassword, useVerifyOtp } from "@/apis/auth";
import { Banner, Button, Text, TextField, toast } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { isEmail, isStrongPassword } from "@/lib/validation";
import { useTheme } from "@/theme";
import { PasswordRules } from "./PasswordRules";

export type ResetStep = "email" | "code" | "password";

const RESEND_SECONDS = 30;

interface Props {
  initialEmail?: string;
  /** In-app use: the email is the signed-in user's and can't be changed. */
  lockEmail?: boolean;
  onStepChange?: (step: ResetStep) => void;
  onDone: () => void;
}

/** Email → one-time code → new password, shared by "Forgot password" and "Change password". */
export function PasswordResetFlow({ initialEmail = "", lockEmail, onStepChange, onDone }: Props) {
  const t = useTheme();
  const [step, setStepState] = useState<ResetStep>("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const request = useRequestPasswordReset();
  const verify = useVerifyOtp();
  const reset = useResetPassword();

  const setStep = (s: ResetStep) => {
    setStepState(s);
    setFieldError(null);
    onStepChange?.(s);
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const sendCode = (advance: boolean) => {
    if (!isEmail(email)) return setFieldError("Enter a valid email address.");
    request.mutate(email.trim().toLowerCase(), {
      onSuccess: () => {
        setCooldown(RESEND_SECONDS);
        if (advance) setStep("code");
        else toast.success("A new code is on its way", "Check your inbox and spam folder.");
      },
    });
  };

  const checkCode = () => {
    if (!/^\d{6}$/.test(code)) return setFieldError("Enter the 6-digit code from your email.");
    verify.mutate({ email: email.trim().toLowerCase(), otp: code }, { onSuccess: () => setStep("password") });
  };

  const savePassword = () => {
    if (!isStrongPassword(password)) return setFieldError("Password doesn't meet the requirements below.");
    if (password !== confirm) return setFieldError("Passwords don't match.");
    reset.mutate({ email: email.trim().toLowerCase(), otp: code, new_password: password }, { onSuccess: onDone });
  };

  const active = step === "email" ? request : step === "code" ? verify : reset;

  return (
    <View style={{ gap: t.space.lg }}>
      <StepDots step={step} />
      {active.error && <Banner tone="danger" message={getErrorMessage(active.error)} />}

      {step === "email" && (
        <>
          <TextField
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setFieldError(null);
            }}
            error={fieldError}
            editable={!lockEmail && !request.isPending}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={() => sendCode(true)}
          />
          <Button title="Send code" size="lg" fullWidth loading={request.isPending} onPress={() => sendCode(true)} />
        </>
      )}

      {step === "code" && (
        <>
          <Text variant="body" tone="muted">
            If an account exists for <Text weight="600">{email.trim()}</Text>, we&apos;ve sent it a 6-digit code. It expires in 10 minutes.
          </Text>
          <TextField
            label="Verification code"
            placeholder="000000"
            value={code}
            onChangeText={(v) => {
              setCode(v.replace(/\D/g, "").slice(0, 6));
              setFieldError(null);
            }}
            error={fieldError}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
            inputSize="lg"
            style={{ letterSpacing: 8, textAlign: "center" }}
            returnKeyType="go"
            onSubmitEditing={checkCode}
            editable={!verify.isPending}
            autoFocus
          />
          <Button title="Verify code" size="lg" fullWidth loading={verify.isPending} disabled={code.length !== 6} onPress={checkCode} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: t.space.sm }}>
            {!lockEmail ? (
              <Button title="Change email" variant="ghost" size="sm" onPress={() => setStep("email")} />
            ) : (
              <View />
            )}
            <Button
              title={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              variant="ghost"
              size="sm"
              disabled={cooldown > 0 || request.isPending}
              loading={request.isPending}
              onPress={() => sendCode(false)}
            />
          </View>
        </>
      )}

      {step === "password" && (
        <>
          <View style={{ gap: t.space.sm }}>
            <TextField
              label="New password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setFieldError(null);
              }}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!reset.isPending}
              autoFocus
            />
            <PasswordRules value={password} />
          </View>
          <TextField
            label="Confirm new password"
            icon="lock-closed-outline"
            value={confirm}
            onChangeText={(v) => {
              setConfirm(v);
              setFieldError(null);
            }}
            error={fieldError}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!reset.isPending}
            returnKeyType="go"
            onSubmitEditing={savePassword}
          />
          <Button title="Update password" size="lg" fullWidth loading={reset.isPending} onPress={savePassword} />
        </>
      )}
    </View>
  );
}

function StepDots({ step }: { step: ResetStep }) {
  const t = useTheme();
  const steps: { key: ResetStep; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "code", label: "Code" },
    { key: "password", label: "New password" },
  ];
  const current = steps.findIndex((s) => s.key === step);
  return (
    <View style={{ flexDirection: "row", gap: t.space.sm }} accessibilityLabel={`Step ${current + 1} of 3: ${steps[current].label}`}>
      {steps.map((s, i) => (
        <View key={s.key} style={{ flex: 1, gap: 6 }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: i <= current ? t.colors.primary : t.colors.surfaceMuted }} />
          <Text variant="caption" tone={i === current ? "default" : "subtle"}>
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
