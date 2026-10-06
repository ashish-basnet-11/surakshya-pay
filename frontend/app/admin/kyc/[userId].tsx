import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useKycSubmission, useReviewKyc } from "@/apis/admin";
import { SecureImage } from "@/components/admin/SecureImage";
import { AppBar, Badge, Banner, Button, Card, DetailList, dialog, ErrorState, kycBadge, Screen, Section, Skeleton, Text, TextField, toast } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { formatDate, titleCase } from "@/lib/format";
import { makeStyles, useBreakpoint } from "@/theme";
import { goBack } from "@/lib/navigation";

export default function KycReview() {
  const s = useStyles();
  const router = useRouter();
  const { atLeastTablet } = useBreakpoint();
  const userId = Number(useLocalSearchParams<{ userId: string }>().userId);
  const query = useKycSubmission(userId);
  const review = useReviewKyc(userId);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const k = query.data;

  const done = (message: string) => {
    toast.success(message);
    goBack(router, { pathname: "/admin", params: { tab: "kyc" } });
  };

  const approve = async () => {
    if (!k) return;
    const ok = await dialog.confirm({ title: `Approve ${k.full_name}?`, message: "The user will be marked as verified.", confirmLabel: "Approve", icon: "checkmark-circle-outline" });
    if (ok) review.mutate({ status: "approved" }, { onSuccess: () => done("Verification approved") });
  };

  const reject = () => {
    if (reason.trim().length < 5) return setReasonError("Explain what the user needs to fix (at least 5 characters).");
    review.mutate({ status: "rejected", rejection_reason: reason.trim() }, { onSuccess: () => done("Verification rejected") });
  };

  const appBar = <AppBar title="Review verification" subtitle={k?.full_name} fallback="/admin" />;

  if (!k) {
    return (
      <Screen appBar={appBar} width="wide">
        {query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <Card style={{ gap: 12 }}>
            <Skeleton width="40%" height={20} />
            <Skeleton />
            <Skeleton height={160} />
          </Card>
        )}
      </Screen>
    );
  }

  const badge = kycBadge(k.status);
  const reviewable = k.status === "pending";

  return (
    <Screen
      appBar={appBar}
      width="wide"
      footer={
        reviewable ? (
          rejecting ? (
            <View style={s.footer}>
              <Button title="Cancel" variant="secondary" size="lg" onPress={() => setRejecting(false)} disabled={review.isPending} style={s.footerButton} />
              <Button title="Reject submission" variant="danger" size="lg" loading={review.isPending} onPress={reject} style={s.footerButton} />
            </View>
          ) : (
            <View style={s.footer}>
              <Button title="Reject" icon="close" variant="secondary" size="lg" onPress={() => setRejecting(true)} style={s.footerButton} />
              <Button title="Approve" icon="checkmark" size="lg" loading={review.isPending} onPress={approve} style={s.footerButton} />
            </View>
          )
        ) : undefined
      }
    >
      {review.error && <Banner tone="danger" title="Couldn't save the decision" message={getErrorMessage(review.error)} />}
      {k.status === "rejected" && k.rejection_reason && <Banner tone="danger" title="Rejected" message={k.rejection_reason} />}

      {rejecting && (
        <Card style={s.rejectCard}>
          <Text variant="h3">Reason for rejection</Text>
          <TextField
            placeholder="e.g. The document photo is blurry. Please upload a clearer image."
            value={reason}
            onChangeText={(v) => {
              setReason(v);
              setReasonError(null);
            }}
            error={reasonError}
            multiline
            autoFocus
            hint="The user will see this message."
          />
        </Card>
      )}

      <View style={[s.columns, atLeastTablet && s.columnsWide]}>
        <View style={[s.col, atLeastTablet && s.colNarrow]}>
          <Card style={s.details}>
            <View style={s.headerRow}>
              <Text variant="h3" style={{ flex: 1 }}>
                Applicant
              </Text>
              <Badge label={badge.label} tone={badge.tone} icon={badge.icon} />
            </View>
            <DetailList
              items={[
                { label: "Full name", value: k.full_name },
                { label: "Date of birth", value: formatDate(k.date_of_birth) },
                { label: "Address", value: k.address },
                { label: "Document", value: titleCase(k.document_type) },
                { label: "Document no.", value: k.document_number, mono: true },
                { label: "Submitted", value: formatDate(k.submitted_at, { dateStyle: "medium", timeStyle: "short" }) },
                ...(k.user ? [{ label: "Account", value: k.user.email }] : []),
              ]}
            />
          </Card>
        </View>
        <View style={[s.col, atLeastTablet && s.colWide]}>
          <Section title="Documents">
            <View style={s.docs}>
              {[
                { label: "Front", path: k.document_front_url },
                { label: "Back", path: k.document_back_url },
                { label: "Selfie", path: k.selfie_url },
              ].map((d) => (
                <View key={d.label} style={s.doc}>
                  <Text variant="smallStrong">{d.label}</Text>
                  <SecureImage path={d.path} label={`${d.label} of submitted document`} style={s.docImage} />
                </View>
              ))}
            </View>
          </Section>
        </View>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  columns: { gap: t.space.xxl },
  columnsWide: { flexDirection: "row", alignItems: "flex-start" },
  col: { gap: t.space.lg },
  colNarrow: { flex: 2, minWidth: 0 },
  colWide: { flex: 3, minWidth: 0 },
  details: { paddingVertical: t.space.xs },
  headerRow: { flexDirection: "row", alignItems: "center", paddingTop: t.space.md, paddingBottom: t.space.xs },
  docs: { flexDirection: "row", flexWrap: "wrap", gap: t.space.md },
  doc: { flexGrow: 1, flexBasis: 200, gap: t.space.xs },
  docImage: { width: "100%", height: 220, borderRadius: t.radius.md, backgroundColor: t.colors.surfaceMuted, borderWidth: 1, borderColor: t.colors.border },
  rejectCard: { gap: t.space.md },
  footer: { flexDirection: "row", gap: t.space.sm, justifyContent: "flex-end" },
  footerButton: { flexGrow: 1, flexBasis: 0, maxWidth: 240 },
}));
