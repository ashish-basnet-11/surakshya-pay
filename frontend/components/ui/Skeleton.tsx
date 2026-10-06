import { useEffect, useState } from "react";
import { Animated, DimensionValue, Platform, StyleProp, View, ViewStyle } from "react-native";
import { makeStyles, useTheme } from "@/theme";

export function Skeleton({
  width = "100%",
  height = 14,
  radius,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.55));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== "web" }),
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: Platform.OS !== "web" }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius ?? t.radius.sm, backgroundColor: t.colors.surfaceMuted, opacity }, style]}
    />
  );
}

/** Placeholder rows matching ListRow / TransactionRow geometry. */
export function SkeletonRows({ count = 4 }: { count?: number }) {
  const s = useStyles();
  return (
    <View style={s.group} accessibilityLabel="Loading" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[s.row, i > 0 && s.border]}>
          <Skeleton width={40} height={40} radius={20} />
          <View style={s.lines}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="35%" height={12} />
          </View>
          <Skeleton width={72} height={14} />
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  group: { backgroundColor: t.colors.surface, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.colors.border },
  row: { flexDirection: "row", alignItems: "center", gap: t.space.md, padding: t.space.lg },
  border: { borderTopWidth: 1, borderTopColor: t.colors.border },
  lines: { flex: 1, gap: t.space.sm },
}));
