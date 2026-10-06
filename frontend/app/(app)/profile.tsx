import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useMe, useUpdateProfile } from "@/apis/user";
import {
  AppBar,
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  CopyButton,
  DetailList,
  ErrorState,
  kycBadge,
  Screen,
  Section,
  Skeleton,
  Text,
  TextField,
  toast,
} from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { formatDate, formatMoney, shortAddress } from "@/lib/format";
import { isPhone } from "@/lib/validation";
import { makeStyles, useBreakpoint } from "@/theme";
import { User } from "@/types/user";

export default function Profile() {
  const s = useStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{ edit?: string }>();
  const { atLeastTablet } = useBreakpoint();
  const me = useMe();
  const [editing, setEditing] = useState(params.edit === "1");
  const user = me.data;

  if (user && editing) return <EditProfile user={user} onClose={() => setEditing(false)} />;

  const appBar = (
    <AppBar
      title="Profile"
      fallback="/account"
      actions={user ? <Button title="Edit" icon="create-outline" variant="secondary" size="sm" onPress={() => setEditing(true)} /> : undefined}
    />
  );

  if (!user) {
    return (
      <Screen appBar={appBar}>
        {me.isError ? (
          <ErrorState error={me.error} title="Couldn't load your profile" onRetry={() => me.refetch()} />
        ) : (
          <Card style={s.header}>
            <Skeleton width={80} height={80} radius={40} />
            <View style={s.headerText}>
              <Skeleton width="50%" height={20} />
              <Skeleton width="30%" />
            </View>
          </Card>
        )}
      </Screen>
    );
  }

  const kyc = kycBadge(user.kyc_status);

  return (
    <Screen appBar={appBar} onRefresh={() => me.refetch()}>
      <ProfileHeader user={user} />

      <Section title="Personal information">
        <Card style={s.detailCard}>
          <DetailList
            items={[
              { label: "Full name", value: user.full_name || "Not added" },
              { label: "Email", value: user.email },
              { label: "Phone", value: user.phone_number || "Not added" },
            ]}
          />
        </Card>
      </Section>

      <Section title="Wallet">
        <Card style={s.detailCard}>
          <DetailList
            items={[
              {
                label: "Username",
                value: (
                  <View style={s.copyRow}>
                    <Text variant="small" weight="500">
                      @{user.username}
                    </Text>
                    <CopyButton value={user.username} label="Copy username" />
                  </View>
                ),
              },
              {
                label: "Wallet address",
                value: (
                  <View style={s.copyRow}>
                    <Text variant="small" weight="500" style={s.mono} selectable>
                      {atLeastTablet ? user.wallet_address : shortAddress(user.wallet_address, 10)}
                    </Text>
                    <CopyButton value={user.wallet_address} label="Copy wallet address" />
                  </View>
                ),
              },
              { label: "Balance", value: formatMoney(user.balance) },
            ]}
          />
        </Card>
      </Section>

      <Section title="Verification">
        <Card style={s.detailCard}>
          <DetailList
            items={[
              { label: "Status", value: <Badge label={kyc.label} tone={kyc.tone} icon={kyc.icon} /> },
              { label: "Submitted", value: user.kyc_submitted_at ? formatDate(user.kyc_submitted_at) : "Not submitted" },
              ...(user.kyc_reviewed_at ? [{ label: "Reviewed", value: formatDate(user.kyc_reviewed_at) }] : []),
            ]}
          />
          {user.kyc_status !== "approved" && user.kyc_status !== "pending" && (
            <Button
              title={user.kyc_status ? "Review verification" : "Verify identity"}
              variant="soft"
              icon="shield-checkmark-outline"
              onPress={() => router.push("/kyc")}
              style={s.kycButton}
            />
          )}
        </Card>
      </Section>
    </Screen>
  );
}

function ProfileHeader({ user, previewName }: { user: User; previewName?: string }) {
  const s = useStyles();
  const { atLeastTablet } = useBreakpoint();
  const kyc = kycBadge(user.kyc_status);
  return (
    <Card style={[s.header, atLeastTablet && s.headerWide]}>
      <Avatar name={previewName || user.full_name} seed={user.username} size={80} />
      <View style={[s.headerText, atLeastTablet && s.headerTextWide]}>
        <Text variant="h2" numberOfLines={2} align={atLeastTablet ? "left" : "center"}>
          {user.full_name || "Unnamed account"}
        </Text>
        <Text variant="body" tone="muted" align={atLeastTablet ? "left" : "center"}>
          @{user.username}
        </Text>
        <View style={[s.badges, !atLeastTablet && s.center]}>
          <Badge label={kyc.label} tone={kyc.tone} icon={kyc.icon} />
          <Badge label={user.is_active === false ? "Inactive" : "Active"} tone={user.is_active === false ? "danger" : "neutral"} />
        </View>
      </View>
    </Card>
  );
}

/** Mounted fresh each time editing starts, so its fields always start from the current profile. */
function EditProfile({ user, onClose }: { user: User; onClose: () => void }) {
  const s = useStyles();
  const { atLeastTablet } = useBreakpoint();
  const update = useUpdateProfile();
  const [name, setName] = useState(user.full_name ?? "");
  const [phone, setPhone] = useState(user.phone_number ?? "");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const dirty = name.trim() !== (user.full_name ?? "") || phone.trim() !== (user.phone_number ?? "");

  const save = () => {
    const next = {
      name: name.trim().length < 2 ? "Enter your full name." : undefined,
      phone: phone.trim() && !isPhone(phone) ? "Enter a valid phone number (7–15 digits)." : undefined,
    };
    setErrors(next);
    if (next.name || next.phone) return;
    update.mutate(
      { full_name: name.trim(), phone_number: phone.replace(/[\s-]/g, "") },
      {
        onSuccess: () => {
          toast.success("Profile updated");
          onClose();
        },
      }
    );
  };

  return (
    <Screen
      appBar={<AppBar title="Edit profile" onBack={onClose} />}
      footer={
        <View style={[s.footerRow, atLeastTablet && s.footerRowWide]}>
          <Button title="Cancel" variant="secondary" size="lg" onPress={onClose} disabled={update.isPending} style={s.footerButton} />
          <Button title="Save changes" size="lg" onPress={save} loading={update.isPending} disabled={!dirty} style={s.footerButton} />
        </View>
      }
    >
      <ProfileHeader user={user} previewName={name} />
      <Section title="Personal information" description="This is how other people see you when you pay them.">
        {update.error && <Banner tone="danger" title="Couldn't save your changes" message={getErrorMessage(update.error)} />}
        <Card style={s.form}>
          <TextField
            label="Full name"
            icon="person-outline"
            value={name}
            onChangeText={(v) => {
              setName(v);
              setErrors((e) => ({ ...e, name: undefined }));
            }}
            error={errors.name}
            autoComplete="name"
            maxLength={255}
            editable={!update.isPending}
          />
          <TextField
            label="Phone number"
            icon="call-outline"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setErrors((e) => ({ ...e, phone: undefined }));
            }}
            error={errors.phone}
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={20}
            editable={!update.isPending}
          />
          <TextField label="Email" icon="mail-outline" value={user.email} editable={false} hint="Your email is your sign-in ID and can't be changed here." />
        </Card>
      </Section>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: { alignItems: "center", gap: t.space.md, paddingVertical: t.space.xxl },
  headerWide: { flexDirection: "row", paddingHorizontal: t.space.xxl },
  headerText: { alignItems: "center", gap: 4, minWidth: 0 },
  headerTextWide: { alignItems: "flex-start", flex: 1 },
  badges: { flexDirection: "row", gap: t.space.xs, flexWrap: "wrap", marginTop: t.space.xs },
  center: { justifyContent: "center" },
  form: { gap: t.space.lg },
  detailCard: { paddingVertical: t.space.xs },
  copyRow: { flexDirection: "row", alignItems: "center", gap: t.space.xs, justifyContent: "flex-end", flexShrink: 1 },
  mono: { fontFamily: "monospace", fontSize: 12, flexShrink: 1 },
  kycButton: { marginVertical: t.space.md, alignSelf: "stretch" },
  footerRow: { flexDirection: "row", gap: t.space.sm },
  footerRowWide: { justifyContent: "flex-end" },
  footerButton: { flexGrow: 1, flexBasis: 0, maxWidth: 220 },
}));
