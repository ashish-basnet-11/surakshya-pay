import { useRouter } from "expo-router";
import { View } from "react-native";
import { useUnreadCount } from "@/apis/notifications";
import { useTransactions } from "@/apis/transactions";
import { useMe } from "@/apis/user";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Avatar, Button, EmptyState, IconButton, QueryView, Screen, Section, SkeletonRows, Text } from "@/components/ui";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { KycPrompt } from "@/components/wallet/KycPrompt";
import { QuickActions } from "@/components/wallet/QuickActions";
import { makeStyles, useBreakpoint } from "@/theme";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const s = useStyles();
  const router = useRouter();
  const { isDesktop, atLeastTablet } = useBreakpoint();
  const me = useMe();
  const transactions = useTransactions({ limit: 20 });
  const unread = useUnreadCount();

  const user = me.data;
  const firstName = user?.full_name?.split(" ")[0];

  const activity = (
    <Section
      title="Recent activity"
      action={<Button title="See all" variant="ghost" size="sm" iconRight="chevron-forward" onPress={() => router.push("/transactions")} />}
    >
      <QueryView
        query={transactions}
        loading={<SkeletonRows count={5} />}
        isEmpty={(d) => d.length === 0}
        empty={
          <View style={s.emptyCard}>
            <EmptyState
              icon="receipt-outline"
              title="No transactions yet"
              message="Add money to your wallet to get started."
              action={<Button title="Add money" icon="add" size="sm" onPress={() => router.push("/topup")} />}
              compact
            />
          </View>
        }
      >
        {(items) => <TransactionList items={items.slice(0, 6)} wallet={user?.wallet_address} />}
      </QueryView>
    </Section>
  );

  return (
    <Screen insetBottom={false} width="wide" onRefresh={() => Promise.all([me.refetch(), transactions.refetch(), unread.refetch()])}>
      <View style={s.header}>
        <Avatar name={user?.full_name} seed={user?.username} size={44} />
        <View style={s.greeting}>
          <Text variant="small" tone="muted">
            {greeting()}
            {firstName ? "," : ""}
          </Text>
          <Text variant="h2" numberOfLines={1} accessibilityRole="header">
            {firstName ?? "Welcome"}
          </Text>
        </View>
        {!isDesktop && <IconButton icon="qr-code-outline" label="Scan or show QR code" variant="outline" onPress={() => router.push("/scan")} />}
        <IconButton icon="notifications-outline" label="Notifications" variant="outline" badge={unread.data} onPress={() => router.push("/notifications")} />
      </View>

      <KycPrompt status={user?.kyc_status} />

      <View style={[s.columns, atLeastTablet && s.columnsWide]}>
        <View style={[s.main, atLeastTablet && s.mainWide]}>
          <BalanceCard balance={user?.balance} wallet={user?.wallet_address} loading={!user && me.isLoading} />
          <QuickActions />
        </View>
        <View style={[s.side, atLeastTablet && s.sideWide]}>{activity}</View>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: { flexDirection: "row", alignItems: "center", gap: t.space.md },
  greeting: { flex: 1, minWidth: 0 },
  columns: { gap: t.space.xxl },
  columnsWide: { flexDirection: "row", alignItems: "flex-start" },
  main: { gap: t.space.lg },
  mainWide: { flex: 5, minWidth: 0 },
  side: {},
  sideWide: { flex: 6, minWidth: 0 },
  emptyCard: { backgroundColor: t.colors.surface, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.colors.border },
}));
