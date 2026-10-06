import { Link, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { useLogin } from "@/apis/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { Banner, Button, Text, TextField } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { isEmail } from "@/lib/validation";
import { useTheme } from "@/theme";

export default function Login() {
  const t = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const passwordRef = useRef<TextInput>(null);
  const login = useLogin();

  const submit = () => {
    const next = {
      email: !email.trim() ? "Enter your email address." : !isEmail(email) ? "Enter a valid email address." : undefined,
      password: !password ? "Enter your password." : undefined,
    };
    setErrors(next);
    if (next.email || next.password) return;
    login.mutate({ email: email.trim().toLowerCase(), password });
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your SurakshyaPay wallet."
      footer={
        <Text variant="small" tone="muted">
          New to SurakshyaPay?{" "}
          <Link href="/register" replace style={{ color: t.colors.primary, fontWeight: "600" }}>
            Create an account
          </Link>
        </Text>
      }
    >
      <View style={{ gap: t.space.lg }}>
        {params.email && !login.error && (
          <Banner tone="success" title="Account created" message="Sign in with your new password to continue." />
        )}
        {login.error && <Banner tone="danger" title="Couldn't sign you in" message={getErrorMessage(login.error)} />}
        <TextField
          label="Email"
          icon="mail-outline"
          placeholder="you@example.com"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!login.isPending}
        />
        <View style={{ gap: t.space.sm }}>
          <TextField
            ref={passwordRef}
            label="Password"
            icon="lock-closed-outline"
            placeholder="Your password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            editable={!login.isPending}
          />
          <Link href={{ pathname: "/forgot-password", params: email ? { email } : {} }} style={{ alignSelf: "flex-end", color: t.colors.primary, fontWeight: "600", fontSize: 13 }}>
            Forgot password?
          </Link>
        </View>
        <Button title={login.isPending ? "Verifying…" : "Sign in"} size="lg" fullWidth loading={login.isPending} onPress={submit} />
        {login.isPending && (
          <Text variant="small" tone="subtle" align="center">
            Generating your zero-knowledge proof. This can take a few seconds.
          </Text>
        )}
      </View>
    </AuthShell>
  );
}
