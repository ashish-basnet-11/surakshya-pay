import { View } from "react-native";
import { initials } from "@/lib/format";
import { useTheme } from "@/theme";
import { Text } from "./Text";

const hues = ["#4F46E5", "#0E7490", "#15803D", "#B45309", "#BE185D", "#7C3AED", "#1D4ED8"];

function hueFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return hues[h % hues.length];
}

export function Avatar({ name, seed, size = 44 }: { name?: string | null; seed?: string | null; size?: number }) {
  const t = useTheme();
  const color = hueFor(seed || name || "?");
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name ? `${name} avatar` : "Avatar"}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: size > 56 ? 3 : 0,
        borderColor: t.colors.surface,
      }}
    >
      <Text color="#FFFFFF" weight="700" style={{ fontSize: size * 0.38, lineHeight: size * 0.46 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
