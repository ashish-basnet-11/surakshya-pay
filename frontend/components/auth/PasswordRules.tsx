import { View } from "react-native";
import { Icon, Text } from "@/components/ui";
import { passwordRules } from "@/lib/validation";

export function PasswordRules({ value }: { value: string }) {
  return (
    <View style={{ gap: 4 }} accessibilityLabel="Password requirements">
      {passwordRules.map((rule) => {
        const ok = rule.test(value);
        return (
          <View key={rule.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon name={ok ? "checkmark-circle" : "ellipse-outline"} size={14} tone={ok ? "success" : "subtle"} />
            <Text variant="small" tone={ok ? "default" : "muted"}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
