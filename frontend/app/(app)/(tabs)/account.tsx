import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useUnreadCount } from "@/apis/notifications";
import { useMe } from "@/apis/user";
import { Avatar, Badge, Button, Card, dialog, Icon, kycBadge, ListGroup, ListRow, PageHeader, Screen, Section, Skeleton, Switch, Text } from "@/components/ui";
import { signOut } from "@/lib/api";
import { usePreferences } from "@/store/use-preferences-store";
import { makeStyles, useBreakpoint } from "@/theme";

const appearanceLabel = { system: "System", light: "Light", dark: "Dark" } as const;

export default function Account() {
  const s = useStyles();
  const router = useRouter();
  const { atLeastTablet } = useBreakpoint();
  const { data: me, isLoading, refetch } = useMe();
  const unread = useUnreadCount();
  const { appearance, hideBalance, setHideBalance } = usePreferences();
  const kyc = kycBadge(me?.kyc_status);

  const confirmSignOut = async () => {
    const ok = await dialog.confirm({ title: "Sign out?", message: "You'll need your password to sign back in.", confirmLabel: "Sign out", icon: "log-out-outline" });
    if (ok) signOut();
  };

  return (
    <Screen insetBottom={false} onRefresh={() => Promise.all([refetch(), unread.refetch()])}>
      <PageHeader title="Account" />

      {/* Phones: the whole card opens the profile. Wider: explicit button (a button can't sit inside a pressable card). */}
      <Card onPress={atLeastTablet ? undefined : () => router.push("/profile")} accessibilityLabel="Open your profile" style={s.profile}>
        <Avatar name={me?.full_name} seed={me?.username} size={64} />
        <View style={s.profileText}>
          {me ? (
            <>
              <Text variant="h3" numberOfLines={1}>
                {me.full_name || "Add your name"}
              </Text>
              <Text variant="small" tone="muted" numberOfLines={1}>
                {me.email}
              </Text>
              <View style={s.badges}>
                <Badge label={kyc.label} tone={kyc.tone} icon={kyc.icon} />
                <Badge label={`@${me.username}`} />
              </View>
            </>
          ) : isLoading ? (
            <>
              <Skeleton width="60%" height={18} />
              <Skeleton width="80%" />
            </>
          ) : null}
        </View>
        {atLeastTablet ? (
          <Button title="Edit profile" variant="secondary" size="sm" onPress={() => router.push({ pathname: "/profile", params: { edit: "1" } })} />
        ) : (
          <Icon name="chevron-forward" size={18} tone="subtle" />
        )}
      </Card>

      <Section title="Account">
        <ListGroup>
          <ListRow icon="person-outline" title="Personal information" subtitle="Name, phone and email" onPress={() => router.push("/profile")} />
          <ListRow
            icon="shield-checkmark-outline"
            iconTone={kyc.tone === "success" ? "success" : kyc.tone === "danger" ? "danger" : "warning"}
            title="Identity verification"
            subtitle="KYC documents"
            value={kyc.label}
            onPress={() => router.push("/kyc")}
          />
          <ListRow icon="key-outline" title="Change password" subtitle="Confirm with a code sent to your email" onPress={() => router.push("/change-password")} />
        </ListGroup>
      </Section>

      <Section title="Wallet">
        <ListGroup>
          <ListRow icon="qr-code-outline" title="My payment code" subtitle="Let others scan to pay you" onPress={() => router.push({ pathname: "/scan", params: { tab: "code" } })} />
          <ListRow icon="receipt-outline" title="Transaction history" onPress={() => router.push("/transactions")} />
          <ListRow icon="notifications-outline" title="Notifications" value={unread.data ? `${unread.data} unread` : undefined} onPress={() => router.push("/notifications")} />
        </ListGroup>
      </Section>

      <Section title="Preferences">
        <ListGroup>
          <ListRow icon="contrast-outline" iconTone="info" title="Appearance" value={appearanceLabel[appearance]} onPress={() => router.push("/preferences")} />
          <ListRow
            icon="eye-off-outline"
            iconTone="info"
            title="Hide balance by default"
            subtitle="Tap the eye on the balance card to reveal it"
            trailing={<Switch value={hideBalance} onValueChange={setHideBalance} accessibilityLabel="Hide balance by default" />}
          />
        </ListGroup>
      </Section>

      <Section title="Support">
        <ListGroup>
          <ListRow icon="information-circle-outline" iconTone="info" title="About SurakshyaPay" value={`v${Constants.expoConfig?.version ?? "1.0.0"}`} onPress={() => router.push("/about")} />
          <ListRow icon="log-out-outline" title="Sign out" destructive onPress={confirmSignOut} showChevron={false} />
        </ListGroup>
      </Section>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  profile: { flexDirection: "row", alignItems: "center", gap: t.space.lg },
  profileText: { flex: 1, minWidth: 0, gap: 4 },
  badges: { flexDirection: "row", gap: t.space.xs, flexWrap: "wrap", marginTop: 2 },
}));
