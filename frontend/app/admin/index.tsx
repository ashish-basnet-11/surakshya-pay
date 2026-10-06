import { useLocalSearchParams, useRouter } from "expo-router";
import { Fragment, useDeferredValue, useState } from "react";
import { View } from "react-native";
import { KycFilter, useAdminStats, useAdminUsers, useKycSubmissions, useSetUserActive } from "@/apis/admin";
import { useMe } from "@/apis/user";
import { BrandMark } from "@/components/auth/AuthShell";
import {
  Avatar,
  Badge,
  Button,
  Card,
  dialog,
  EmptyState,
  ErrorState,
  IconButton,
  kycBadge,
  ListRow,
  PageHeader,
  QueryView,
  Screen,
  Section,
  SegmentedControl,
  SkeletonRows,
  StatGrid,
  StatTile,
  Switch,
  Text,
  TextField,
  toast,
} from "@/components/ui";
import { signOut } from "@/lib/api";
import { formatCompact, formatMoney, formatRelative, titleCase } from "@/lib/format";
import { makeStyles, useBreakpoint } from "@/theme";

type Tab = "overview" | "kyc" | "users";

export default function AdminHome() {
  const s = useStyles();
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? "overview");
  const { data: me } = useMe();
  const { atLeastTablet } = useBreakpoint();

  const confirmSignOut = async () => {
    if (await dialog.confirm({ title: "Sign out?", confirmLabel: "Sign out", icon: "log-out-outline" })) signOut();
  };

  return (
    <Screen width="wide">
      <View style={s.topBar}>
        <BrandMark />
        <Badge label="Admin" tone="primary" icon="key" />
        <View style={s.spacer} />
        {atLeastTablet && (
          <Text variant="small" tone="muted" numberOfLines={1} style={s.email}>
            {me?.email}
          </Text>
        )}
        <IconButton icon="log-out-outline" label="Sign out" variant="outline" onPress={confirmSignOut} />
      </View>
      <PageHeader title="Admin console" description="Monitor activity, review identity verification and manage accounts." />
      <SegmentedControl
        accessibilityLabel="Admin sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: "overview", label: "Overview", icon: "grid-outline" },
          { value: "kyc", label: "Verification", icon: "shield-checkmark-outline" },
          { value: "users", label: "Users", icon: "people-outline" },
        ]}
      />
      {tab === "overview" && <Overview onReview={() => setTab("kyc")} />}
      {tab === "kyc" && <KycQueue />}
      {tab === "users" && <Users />}
    </Screen>
  );
}

function Overview({ onReview }: { onReview: () => void }) {
  const query = useAdminStats();
  if (query.isError && !query.data) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const d = query.data?.dashboard;
  const u = query.data?.users;
  const loading = !query.data;
  return (
    <>
      {!!d?.total_kyc_pending && (
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <View style={{ flex: 1, minWidth: 200 }}>
            <Text variant="bodyStrong">
              {d.total_kyc_pending} verification {d.total_kyc_pending === 1 ? "request is" : "requests are"} waiting
            </Text>
            <Text variant="small" tone="muted">
              Review documents to approve or reject.
            </Text>
          </View>
          <Button title="Review now" iconRight="arrow-forward" size="sm" onPress={onReview} />
        </Card>
      )}
      <Section title="Users">
        <StatGrid>
          <StatTile label="Total users" icon="people-outline" tone="primary" value={formatCompact(u?.total_users ?? 0)} loading={loading} />
          <StatTile label="Active" icon="pulse-outline" tone="success" value={formatCompact(u?.active_users ?? 0)} loading={loading} />
          <StatTile label="New this week" icon="person-add-outline" tone="info" value={formatCompact(u?.new_users_this_week ?? 0)} loading={loading} />
          <StatTile label="Verified" icon="shield-checkmark-outline" tone="success" value={formatCompact(u?.kyc_verified_users ?? 0)} loading={loading} />
        </StatGrid>
      </Section>
      <Section title="Money movement">
        <StatGrid>
          <StatTile label="Transactions" icon="swap-vertical" value={formatCompact(d?.total_transactions ?? 0)} loading={loading} />
          <StatTile label="Deposited" icon="arrow-down" tone="success" value={formatMoney(d?.total_deposit_amount)} loading={loading} />
          <StatTile label="Withdrawn" icon="arrow-up" tone="danger" value={formatMoney(d?.total_withdrawal_amount)} loading={loading} />
          <StatTile label="Transferred" icon="paper-plane-outline" tone="primary" value={formatMoney(d?.total_transfer_amount)} loading={loading} />
        </StatGrid>
      </Section>
      <Section title="Verification">
        <StatGrid>
          <StatTile label="Submitted" icon="documents-outline" value={formatCompact(d?.total_kyc_submitted ?? 0)} loading={loading} />
          <StatTile label="Pending" icon="time-outline" tone="warning" value={formatCompact(d?.total_kyc_pending ?? 0)} loading={loading} />
          <StatTile label="Approved" icon="checkmark-circle-outline" tone="success" value={formatCompact(d?.total_kyc_approved ?? 0)} loading={loading} />
          <StatTile label="Rejected" icon="close-circle-outline" tone="danger" value={formatCompact(d?.total_kyc_rejected ?? 0)} loading={loading} />
        </StatGrid>
      </Section>
    </>
  );
}

function KycQueue() {
  const s = useStyles();
  const router = useRouter();
  const [status, setStatus] = useState<KycFilter>("pending");
  const query = useKycSubmissions(status);
  return (
    <Section title="Verification requests">
      <SegmentedControl
        accessibilityLabel="Filter by status"
        value={status}
        onChange={setStatus}
        options={[
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
          { value: "all", label: "All" },
        ]}
      />
      <QueryView
        query={query}
        loading={<SkeletonRows count={5} />}
        isEmpty={(d) => d.length === 0}
        empty={
          <Card>
            <EmptyState icon="shield-checkmark-outline" title={status === "pending" ? "Queue is clear" : "Nothing here"} message={status === "pending" ? "There are no requests waiting for review." : undefined} />
          </Card>
        }
      >
        {(items) => (
          <Card padded={false}>
            {items.map((k, i) => {
              const b = kycBadge(k.status);
              return (
                <Fragment key={k.id}>
                  {i > 0 && <View style={s.sep} />}
                  <ListRow
                    leading={<Avatar name={k.full_name} seed={String(k.user_id)} size={40} />}
                    title={k.full_name}
                    subtitle={`${titleCase(k.document_type)} · submitted ${formatRelative(k.submitted_at)}`}
                    trailing={<Badge label={b.label} tone={b.tone} />}
                    onPress={() => router.push({ pathname: "/admin/kyc/[userId]", params: { userId: String(k.user_id) } })}
                  />
                </Fragment>
              );
            })}
          </Card>
        )}
      </QueryView>
    </Section>
  );
}

function Users() {
  const s = useStyles();
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search.trim());
  const query = useAdminUsers(deferred);
  const setActive = useSetUserActive();

  const toggle = async (id: number, name: string, isActive: boolean) => {
    const ok = await dialog.confirm({
      title: isActive ? `Reactivate ${name}?` : `Deactivate ${name}?`,
      message: isActive ? "They'll be able to sign in and transact again." : "They won't be able to sign in or move money until reactivated.",
      confirmLabel: isActive ? "Reactivate" : "Deactivate",
      destructive: !isActive,
      icon: isActive ? "person-outline" : "person-remove-outline",
    });
    if (!ok) return;
    setActive.mutate(
      { userId: id, isActive },
      { onSuccess: () => toast.success(isActive ? "Account reactivated" : "Account deactivated"), onError: (e) => toast.error(e) }
    );
  };

  return (
    <Section title="Accounts">
      <TextField placeholder="Search by name, email or username" icon="search" value={search} onChangeText={setSearch} returnKeyType="search" />
      <QueryView
        query={query}
        loading={<SkeletonRows count={6} />}
        isEmpty={(d) => d.length === 0}
        empty={
          <Card>
            <EmptyState icon="people-outline" title={deferred ? "No matching accounts" : "No accounts yet"} />
          </Card>
        }
      >
        {(users) => (
          <Card padded={false}>
            {users.map((u, i) => {
              const b = kycBadge(u.kyc_status);
              return (
                <Fragment key={u.id}>
                  {i > 0 && <View style={s.sep} />}
                  <ListRow
                    leading={<Avatar name={u.full_name} seed={u.username} size={40} />}
                    title={u.full_name || u.email}
                    subtitle={`${u.email} · ${b.label}${u.is_superuser ? " · Admin" : ""}`}
                    trailing={
                      u.is_superuser ? (
                        <Badge label="Admin" tone="primary" />
                      ) : (
                        <Switch
                          value={u.is_active !== false}
                          onValueChange={(v) => toggle(u.id, u.full_name || u.email, v)}
                          disabled={setActive.isPending}
                          accessibilityLabel={`${u.full_name || u.email} account active`}
                        />
                      )
                    }
                  />
                </Fragment>
              );
            })}
          </Card>
        )}
      </QueryView>
    </Section>
  );
}

const useStyles = makeStyles((t) => ({
  topBar: { flexDirection: "row", alignItems: "center", gap: t.space.md },
  spacer: { flex: 1 },
  email: { maxWidth: 220 },
  sep: { height: 1, backgroundColor: t.colors.border, marginLeft: 72 },
}));
