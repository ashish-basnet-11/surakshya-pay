import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useTransaction } from "@/apis/transactions";
import { getDirection } from "@/lib/direction";
import { useMe } from "@/apis/user";
import { describeTransaction } from "@/components/transactions/TransactionRow";
import { AppBar, Badge, Card, CopyButton, DetailList, ErrorState, Icon, Screen, Skeleton, Text } from "@/components/ui";
import { formatDateTime, formatMoney, shortAddress, titleCase } from "@/lib/format";
import { makeStyles, useBreakpoint, useTheme } from "@/theme";

export default function TransactionDetail() {
  const t = useTheme();
  const s = useStyles();
  const { atLeastTablet } = useBreakpoint();
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const query = useTransaction(id);
  const me = useMe();
  const tx = query.data;

  const appBar = <AppBar title="Transaction" fallback="/transactions" />;

  if (!tx) {
    return (
      <Screen appBar={appBar}>
        {query.isError ? (
          <ErrorState error={query.error} title="Couldn't load this transaction" onRetry={() => query.refetch()} />
        ) : (
          <Card style={s.hero}>
            <Skeleton width={56} height={56} radius={28} />
            <Skeleton width="40%" height={32} />
            <Skeleton width="30%" />
          </Card>
        )}
      </Screen>
    );
  }

  const direction = getDirection(tx, me.data?.wallet_address);
  const incoming = direction === "in";
  const { title, icon } = describeTransaction(tx, direction);
  const address = (value: string | null) =>
    value ? (
      <View style={s.copyRow}>
        <Text variant="small" style={s.mono} selectable numberOfLines={1}>
          {atLeastTablet ? value : shortAddress(value, 8)}
        </Text>
        <CopyButton value={value} />
      </View>
    ) : (
      "—"
    );

  return (
    <Screen appBar={appBar}>
      <Card style={s.hero}>
        <View style={[s.icon, { backgroundColor: incoming ? t.colors.successSoft : t.colors.surfaceMuted }]}>
          <Icon name={icon} size={26} tone={incoming ? "success" : "default"} />
        </View>
        <Text variant="body" tone="muted">
          {title}
        </Text>
        <Text variant="display" tone={incoming ? "success" : "default"} tabular>
          {formatMoney(incoming ? Math.abs(tx.amount) : -Math.abs(tx.amount), { sign: true })}
        </Text>
        <Badge label={tx.is_completed ? "Completed" : "Pending"} tone={tx.is_completed ? "success" : "warning"} icon={tx.is_completed ? "checkmark-circle" : "time"} />
      </Card>

      <Card style={s.details}>
        <DetailList
          items={[
            { label: "Date", value: formatDateTime(tx.timestamp) },
            { label: "Type", value: titleCase(tx.transaction_type.toLowerCase()) },
            { label: "Category", value: tx.category ? titleCase(tx.category) : "—" },
            { label: "Description", value: tx.description },
            { label: "Reference", value: `#${tx.id}` },
          ]}
        />
      </Card>

      <Card style={s.details}>
        <Text variant="h3" style={s.cardTitle}>
          On-chain record
        </Text>
        <DetailList
          items={[
            { label: "From", value: address(tx.from_address) },
            { label: "To", value: address(tx.to_address) },
            { label: "Transaction hash", value: address(tx.blockchain_hash) },
          ]}
        />
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { alignItems: "center", gap: t.space.sm, paddingVertical: t.space.xxl },
  icon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: t.space.xs },
  details: { paddingVertical: t.space.xs },
  cardTitle: { paddingTop: t.space.md, paddingBottom: t.space.xs },
  copyRow: { flexDirection: "row", alignItems: "center", gap: t.space.xs, justifyContent: "flex-end", flexShrink: 1, maxWidth: "100%" },
  mono: { fontFamily: "monospace", fontSize: 12, flexShrink: 1 },
}));
