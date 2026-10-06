import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageStyle, Platform, StyleProp, View } from "react-native";
import { API_BASE_URL } from "@/lib/api";
import { useAuthStore } from "@/store/use-auth-store";
import { useTheme } from "@/theme";
import { Icon, Text } from "@/components/ui";

/** KYC uploads are stored as "/uploads/<file>" and served only to admins with a bearer token. */
export function documentUrl(stored?: string | null) {
  if (!stored) return null;
  return `${API_BASE_URL}/kyc/admin/document/${encodeURIComponent(stored.split("/").pop()!)}`;
}

export function SecureImage({ path, style, label }: { path?: string | null; style: StyleProp<ImageStyle>; label: string }) {
  const t = useTheme();
  const token = useAuthStore((s) => s.accessToken);
  const url = documentUrl(path);
  const [webSrc, setWebSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // Browsers can't attach headers to <img>, so fetch the bytes and use an object URL.
  useEffect(() => {
    if (Platform.OS !== "web" || !url) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setWebSrc(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, token]);

  const placeholder = (content: React.ReactNode) => (
    <View style={[style as object, { alignItems: "center", justifyContent: "center", backgroundColor: t.colors.surfaceMuted, gap: 4 }]}>{content}</View>
  );

  if (!url) return placeholder(<Text variant="caption" tone="subtle">Not provided</Text>);
  if (failed)
    return placeholder(
      <>
        <Icon name="image-outline" tone="subtle" />
        <Text variant="caption" tone="subtle">
          {"Couldn't load"}
        </Text>
      </>
    );
  if (Platform.OS === "web") {
    return webSrc ? <Image source={{ uri: webSrc }} style={style} resizeMode="contain" accessibilityLabel={label} /> : placeholder(<ActivityIndicator color={t.colors.primary} />);
  }
  return (
    <Image
      source={{ uri: url, headers: { Authorization: `Bearer ${token}` } }}
      style={style}
      resizeMode="contain"
      accessibilityLabel={label}
      onError={() => setFailed(true)}
    />
  );
}
