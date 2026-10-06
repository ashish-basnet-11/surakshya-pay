import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { useRegister } from "@/apis/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { Banner, Button, Text, TextField } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { isEmail, isPhone, isStrongPassword } from "@/lib/validation";
import { useBreakpoint, useTheme } from "@/theme";

type Field = "firstName" | "lastName" | "email" | "phone" | "password" | "confirm";

function validate(v: Record<Field, string>): Partial<Record<Field, string>> {
  return {
    firstName: v.firstName.trim() ? undefined : "Enter your first name.",
    lastName: v.lastName.trim() ? undefined : "Enter your last name.",
    email: !v.email.trim() ? "Enter your email address." : !isEmail(v.email) ? "Enter a valid email address." : undefined,
    phone: !v.phone.trim() ? "Enter your phone number." : !isPhone(v.phone) ? "Enter a valid phone number (7–15 digits)." : undefined,
    password: !v.password ? "Create a password." : !isStrongPassword(v.password) ? "Password doesn't meet the requirements below." : undefined,
    confirm: !v.confirm ? "Confirm your password." : v.confirm !== v.password ? "Passwords don't match." : undefined,
  };
}

export default function Register() {
  const t = useTheme();
  const router = useRouter();
  const { atLeastTablet } = useBreakpoint();
  const register = useRegister();
  const [values, setValues] = useState<Record<Field, string>>({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState(false);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const set = (field: Field) => (v: string) => {
    const next = { ...values, [field]: v };
    setValues(next);
    // After the first submit attempt, re-validate as the user fixes things.
    if (touched) setErrors(validate(next));
  };

  const submit = () => {
    setTouched(true);
    const next = validate(values);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const email = values.email.trim().toLowerCase();
    register.mutate(
      {
        full_name: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email,
        phone_number: values.phone.replace(/[\s-]/g, ""),
        password: values.password,
      },
      { onSuccess: () => router.replace({ pathname: "/login", params: { email } }) }
    );
  };

  const busy = register.isPending;
  const common = { editable: !busy, returnKeyType: "next" as const };

  return (
    <AuthShell
      title="Create your account"
      description="It takes a minute. You'll verify your identity later to unlock everything."
      footer={
        <Text variant="small" tone="muted">
          Already have an account?{" "}
          <Link href="/login" replace style={{ color: t.colors.primary, fontWeight: "600" }}>
            Sign in
          </Link>
        </Text>
      }
    >
      <View style={{ gap: t.space.lg }}>
        {register.error && <Banner tone="danger" title="Couldn't create your account" message={getErrorMessage(register.error)} />}
        <View style={{ flexDirection: atLeastTablet ? "row" : "column", gap: t.space.lg }}>
          <TextField
            label="First name"
            placeholder="Sita"
            value={values.firstName}
            onChangeText={set("firstName")}
            error={errors.firstName}
            autoComplete="given-name"
            textContentType="givenName"
            containerStyle={{ flex: 1 }}
            onSubmitEditing={() => lastNameRef.current?.focus()}
            {...common}
          />
          <TextField
            ref={lastNameRef}
            label="Last name"
            placeholder="Sharma"
            value={values.lastName}
            onChangeText={set("lastName")}
            error={errors.lastName}
            autoComplete="family-name"
            textContentType="familyName"
            containerStyle={{ flex: 1 }}
            onSubmitEditing={() => emailRef.current?.focus()}
            {...common}
          />
        </View>
        <TextField
          ref={emailRef}
          label="Email"
          icon="mail-outline"
          placeholder="you@example.com"
          value={values.email}
          onChangeText={set("email")}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          onSubmitEditing={() => phoneRef.current?.focus()}
          {...common}
        />
        <TextField
          ref={phoneRef}
          label="Phone number"
          icon="call-outline"
          placeholder="98XXXXXXXX"
          value={values.phone}
          onChangeText={set("phone")}
          error={errors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          onSubmitEditing={() => passwordRef.current?.focus()}
          {...common}
        />
        <View style={{ gap: t.space.sm }}>
          <TextField
            ref={passwordRef}
            label="Password"
            icon="lock-closed-outline"
            placeholder="Create a password"
            value={values.password}
            onChangeText={set("password")}
            error={errors.password}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={() => confirmRef.current?.focus()}
            {...common}
          />
          <PasswordRules value={values.password} />
        </View>
        <TextField
          ref={confirmRef}
          label="Confirm password"
          icon="lock-closed-outline"
          placeholder="Repeat your password"
          value={values.confirm}
          onChangeText={set("confirm")}
          error={errors.confirm}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          editable={!busy}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <Button title="Create account" size="lg" fullWidth loading={busy} onPress={submit} />
      </View>
    </AuthShell>
  );
}
