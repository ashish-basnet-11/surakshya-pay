import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Platform, Share, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useMe } from "@/apis/user";
import { AppBar, Button, Card, EmptyState, Screen, SegmentedControl, Skeleton, Text, toast } from "@/components/ui";
import { makeStyles, useTheme } from "@/theme";

type Tab = "scan" | "code";

/** Codes encode the plain username; also accept "@name" or a surakshyapay:// link. */
function parseCode(data: string): string | null {
  const value = data.trim().replace(/^surakshyapay:\/\/pay\//i, "").replace(/^@/, "");
  return /^[\w.-]{2,64}$/.test(value) ? value : null;
}

export default function Scan() {
  const s = useStyles();
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab === "code" ? "code" : "scan");

  return (
    <Screen appBar={<AppBar title={tab === "scan" ? "Scan to pay" : "My payment code"} />} width="narrow">
      <SegmentedControl
        accessibilityLabel="Scan or show code"
        value={tab}
        onChange={setTab}
        options={[
          { value: "scan", label: "Scan", icon: "scan-outline" },
          { value: "code", label: "My code", icon: "qr-code-outline" },
        ]}
      />
      <View style={s.body}>{tab === "scan" ? <Scanner /> : <MyCode />}</View>
    </Screen>
  );
}

function Scanner() {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);
  const [invalid, setInvalid] = useState(false);

  if (!permission) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={t.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <Card>
        <EmptyState
          icon="camera-outline"
          title="Camera access needed"
          message={
            permission.canAskAgain
              ? "Allow camera access to scan someone's payment code."
              : "Camera access is turned off for SurakshyaPay. Enable it in your device settings, or enter a username instead."
          }
          action={
            <View style={s.actions}>
              {permission.canAskAgain && <Button title="Allow camera" icon="camera" onPress={requestPermission} />}
              <Button title="Enter username" variant="secondary" onPress={() => router.replace("/send")} />
            </View>
          }
        />
      </Card>
    );
  }

  return (
    <View style={s.scanner}>
      <View style={s.cameraFrame}>
        <CameraView
          style={s.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => {
            if (handled.current) return;
            const username = parseCode(data);
            if (!username) return setInvalid(true);
            handled.current = true;
            router.replace({ pathname: "/send", params: { to: username } });
          }}
        />
        <View style={s.reticle} />
      </View>
      <Text variant="body" tone={invalid ? "danger" : "muted"} align="center">
        {invalid ? "That isn't a SurakshyaPay code. Try another one." : "Point your camera at a SurakshyaPay payment code."}
      </Text>
      <Button title="Enter username instead" variant="ghost" icon="create-outline" onPress={() => router.replace("/send")} style={s.centerSelf} />
    </View>
  );
}

function MyCode() {
  const t = useTheme();
  const s = useStyles();
  const { data: me } = useMe();

  const share = async () => {
    if (!me) return;
    const message = `Pay me on SurakshyaPay: @${me.username}`;
    try {
      if (Platform.OS === "web" && !(navigator as Navigator & { share?: unknown }).share) throw new Error("no share");
      await Share.share({ message });
    } catch {
      await Clipboard.setStringAsync(me.username);
      toast.success("Username copied", "Paste it anywhere to share.");
    }
  };

  return (
    <Card style={s.codeCard}>
      <View style={s.qrWrap}>
        {me ? <QRCode value={me.username} size={220} color="#0F172A" backgroundColor="#FFFFFF" /> : <Skeleton width={220} height={220} />}
      </View>
      <View style={s.codeText}>
        <Text variant="h3" align="center">
          {me?.full_name || " "}
        </Text>
        <Text variant="body" tone="muted" align="center">
          {me ? `@${me.username}` : " "}
        </Text>
      </View>
      <Text variant="small" tone="subtle" align="center">
        Anyone with SurakshyaPay can scan this to send you money.
      </Text>
      <View style={s.actions}>
        <Button
          title="Copy username"
          icon="copy-outline"
          variant="secondary"
          onPress={async () => {
            if (!me) return;
            await Clipboard.setStringAsync(me.username);
            toast.success("Username copied");
          }}
        />
        <Button title="Share" icon="share-outline" onPress={share} />
      </View>
      <View style={[s.tip, { backgroundColor: t.colors.surfaceMuted }]}>
        <Text variant="caption" tone="muted" align="center">
          Your code only contains your username. It never includes your balance or keys.
        </Text>
      </View>
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  body: { gap: t.space.lg },
  center: { paddingVertical: t.space.huge, alignItems: "center" },
  centerSelf: { alignSelf: "center" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: t.space.sm, justifyContent: "center" },
  scanner: { gap: t.space.lg },
  cameraFrame: { width: "100%", aspectRatio: 1, borderRadius: t.radius.xl, overflow: "hidden", backgroundColor: "#000000" },
  camera: { flex: 1 },
  reticle: {
    position: "absolute",
    top: "18%",
    left: "18%",
    right: "18%",
    bottom: "18%",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: t.radius.lg,
    pointerEvents: "none",
  },
  codeCard: { alignItems: "center", gap: t.space.lg, paddingVertical: t.space.xxl },
  qrWrap: { padding: t.space.lg, backgroundColor: "#FFFFFF", borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.colors.border },
  codeText: { gap: 2 },
  tip: { padding: t.space.md, borderRadius: t.radius.md, alignSelf: "stretch" },
}));
