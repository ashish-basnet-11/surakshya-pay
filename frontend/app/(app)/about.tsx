import Constants from "expo-constants";
import { View } from "react-native";
import { BrandMark } from "@/components/auth/AuthShell";
import { AppBar, Card, DetailList, Icon, IconName, Screen, Section, Text } from "@/components/ui";
import { API_BASE_URL } from "@/lib/api";
import { useTheme } from "@/theme";

const features: { icon: IconName; title: string; text: string }[] = [
  { icon: "finger-print-outline", title: "Zero-knowledge sign-in", text: "Your password is never stored. At sign-in it is checked by generating a zk-SNARK proof against a commitment saved when you registered." },
  { icon: "link-outline", title: "Blockchain ledger", text: "Top-ups, withdrawals and transfers are executed by a smart contract and recorded on-chain." },
  { icon: "shield-checkmark-outline", title: "Verified accounts", text: "Identity verification (KYC) is reviewed by an administrator before accounts are fully trusted." },
  { icon: "pie-chart-outline", title: "Budgets that update themselves", text: "Tag a payment with a category and the matching budget tracks it automatically." },
];

export default function About() {
  const t = useTheme();
  return (
    <Screen appBar={<AppBar title="About" fallback="/account" />} width="narrow">
      <Card style={{ gap: t.space.md, alignItems: "flex-start" }}>
        <BrandMark />
        <Text variant="body" tone="muted">
          A digital wallet that combines zero-knowledge authentication with a blockchain-backed ledger.
        </Text>
      </Card>
      <Section title="How your money is protected">
        <Card style={{ gap: t.space.xl }}>
          {features.map((f) => (
            <View key={f.title} style={{ flexDirection: "row", gap: t.space.md }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: t.colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
                <Icon name={f.icon} size={18} tone="primary" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyStrong">{f.title}</Text>
                <Text variant="small" tone="muted">
                  {f.text}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </Section>
      <Section title="App information">
        <Card style={{ paddingVertical: t.space.xs }}>
          <DetailList
            items={[
              { label: "Version", value: Constants.expoConfig?.version ?? "1.0.0" },
              { label: "Server", value: API_BASE_URL, mono: true },
            ]}
          />
        </Card>
      </Section>
    </Screen>
  );
}
