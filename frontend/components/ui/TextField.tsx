import { forwardRef, ReactNode, useState } from "react";
import { Pressable, StyleProp, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { makeStyles, useTheme } from "@/theme";
import { Icon, IconName } from "./Icon";
import { Text } from "./Text";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string | null;
  icon?: IconName;
  /** Rendered at the right edge inside the field. */
  trailing?: ReactNode;
  prefix?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputSize?: "md" | "lg";
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, hint, error, icon, trailing, prefix, containerStyle, secureTextEntry, editable = true, inputSize = "md", style, onFocus, onBlur, ...rest },
  ref
) {
  const t = useTheme();
  const s = useStyles();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isSecret = !!secureTextEntry;

  return (
    <View style={[s.container, containerStyle]}>
      {label && (
        <Text variant="smallStrong" tone="default" style={s.label} nativeID={rest.nativeID ? `${rest.nativeID}-label` : undefined}>
          {label}
        </Text>
      )}
      <View
        style={[
          s.field,
          inputSize === "lg" && s.fieldLg,
          focused && s.focused,
          !!error && s.errored,
          !editable && s.disabled,
        ]}
      >
        {icon && <Icon name={icon} size={18} tone="subtle" />}
        {prefix && (
          <Text variant="bodyStrong" tone="muted">
            {prefix}
          </Text>
        )}
        <TextInput
          ref={ref}
          placeholderTextColor={t.colors.textSubtle}
          selectionColor={t.colors.primary}
          editable={editable}
          secureTextEntry={isSecret && !revealed}
          accessibilityLabel={label ?? rest.placeholder}
          accessibilityHint={error ?? hint}
          aria-invalid={!!error}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
          style={[s.input, inputSize === "lg" && s.inputLg, rest.multiline && s.multiline, { fontFamily: t.fontFamily }, style]}
        />
        {isSecret && (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            hitSlop={8}
            style={s.trailingButton}
          >
            <Icon name={revealed ? "eye-off-outline" : "eye-outline"} size={20} tone="subtle" />
          </Pressable>
        )}
        {trailing}
      </View>
      {error ? (
        <View style={s.messageRow} accessibilityLiveRegion="polite">
          <Icon name="alert-circle" size={14} tone="danger" />
          <Text variant="small" tone="danger" style={s.flex}>
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text variant="small" tone="subtle" style={s.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const useStyles = makeStyles((t) => ({
  container: { gap: t.space.xs + 2, alignSelf: "stretch" },
  label: { marginBottom: 2 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.sm,
    minHeight: 48,
    paddingHorizontal: t.space.md + 2,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.borderStrong,
    backgroundColor: t.colors.surface,
  },
  fieldLg: { minHeight: 64, borderRadius: t.radius.lg },
  focused: { borderColor: t.colors.primary, boxShadow: `0px 0px 0px 3px ${t.colors.primarySoft}` },
  errored: { borderColor: t.colors.danger },
  disabled: { backgroundColor: t.colors.surfaceMuted },
  input: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    fontSize: 15,
    color: t.colors.text,
    paddingVertical: t.space.md,
    outlineWidth: 0,
  },
  inputLg: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  trailingButton: { padding: 2 },
  messageRow: { flexDirection: "row", alignItems: "flex-start", gap: t.space.xs, paddingTop: 1 },
  hint: { paddingTop: 1 },
  flex: { flex: 1 },
}));
