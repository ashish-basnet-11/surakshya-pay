import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Platform, Pressable, View } from "react-native";
import { useMyKyc, useSubmitKyc } from "@/apis/kyc";
import { useMe } from "@/apis/user";
import {
  AppBar,
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  ChipRow,
  DateField,
  DetailList,
  ErrorState,
  Icon,
  InteractionState,
  kycBadge,
  Screen,
  Skeleton,
  Text,
  TextField,
  toast,
  toISODate,
} from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { formatDate, titleCase } from "@/lib/format";
import { makeStyles, useBreakpoint, useTheme } from "@/theme";
import { DocumentType, Kyc, PickedFile } from "@/types/kyc";
import { goBack } from "@/lib/navigation";

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "citizenship", label: "Citizenship" },
  { value: "passport", label: "Passport" },
  { value: "driving_license", label: "Driving licence" },
];

type Step = 0 | 1 | 2;
const stepLabels = ["Personal details", "Documents", "Review"];

export default function KycScreen() {
  const query = useMyKyc();
  const [resubmitting, setResubmitting] = useState(false);
  const appBar = <AppBar title="Identity verification" fallback="/account" />;

  if (query.isError && query.data === undefined) {
    return (
      <Screen appBar={appBar}>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Screen>
    );
  }
  if (query.data === undefined) {
    return (
      <Screen appBar={appBar}>
        <Card style={{ gap: 12 }}>
          <Skeleton width="40%" height={20} />
          <Skeleton />
          <Skeleton width="70%" />
        </Card>
      </Screen>
    );
  }

  const kyc = query.data;
  const needsForm = !kyc || resubmitting;
  if (needsForm) return <KycForm previous={kyc} onCancel={kyc ? () => setResubmitting(false) : undefined} onDone={() => setResubmitting(false)} />;
  return <KycStatus kyc={kyc} onResubmit={() => setResubmitting(true)} onRefresh={() => query.refetch()} />;
}

function KycStatus({ kyc, onResubmit, onRefresh }: { kyc: Kyc; onResubmit: () => void; onRefresh: () => Promise<unknown> }) {
  const s = useStyles();
  const badge = kycBadge(kyc.status);
  const rejected = kyc.status === "rejected" || kyc.status === "resubmit_required";
  const copy = {
    approved: { title: "You're verified", text: "Your identity has been confirmed. Thanks for helping keep SurakshyaPay safe." },
    pending: { title: "We're reviewing your documents", text: "This usually takes less than a day. We'll notify you when it's done." },
    rejected: { title: "Verification wasn't approved", text: "Please check the reason below and submit again." },
    resubmit_required: { title: "Please resubmit your documents", text: "Something needs to be corrected. Check the reason below." },
  }[kyc.status];

  return (
    <Screen appBar={<AppBar title="Identity verification" fallback="/account" />} onRefresh={onRefresh}>
      <Card style={s.statusCard}>
        <View style={[s.statusIcon, s[`icon_${badge.tone}` as "icon_success"]]}>
          <Icon name={badge.icon} size={28} tone={badge.tone === "neutral" ? "muted" : badge.tone} />
        </View>
        <Badge label={badge.label} tone={badge.tone} />
        <Text variant="h2" align="center">
          {copy.title}
        </Text>
        <Text variant="body" tone="muted" align="center" style={s.statusText}>
          {copy.text}
        </Text>
      </Card>
      {rejected && <Banner tone="danger" title="Reason" message={kyc.rejection_reason || "No reason was given."} action={<Button title="Resubmit" size="sm" onPress={onResubmit} />} />}
      <Card style={s.details}>
        <Text variant="h3" style={s.detailsTitle}>
          Submitted details
        </Text>
        <DetailList
          items={[
            { label: "Full name", value: kyc.full_name },
            { label: "Date of birth", value: formatDate(kyc.date_of_birth) },
            { label: "Address", value: kyc.address },
            { label: "Document", value: titleCase(kyc.document_type) },
            { label: "Document number", value: `•••• ${kyc.document_number.slice(-4)}` },
            { label: "Submitted", value: formatDate(kyc.submitted_at, { dateStyle: "medium", timeStyle: "short" }) },
            ...(kyc.reviewed_at ? [{ label: "Reviewed", value: formatDate(kyc.reviewed_at, { dateStyle: "medium", timeStyle: "short" }) }] : []),
          ]}
        />
      </Card>
    </Screen>
  );
}

function KycForm({ previous, onCancel, onDone }: { previous: Kyc | null; onCancel?: () => void; onDone: () => void }) {
  const t = useTheme();
  const s = useStyles();
  const router = useRouter();
  const { atLeastTablet } = useBreakpoint();
  const { data: me } = useMe();
  const submit = useSubmitKyc();
  const [step, setStep] = useState<Step>(0);
  const [fullName, setFullName] = useState(previous?.full_name ?? me?.full_name ?? "");
  const [dob, setDob] = useState(previous?.date_of_birth ?? "");
  const [address, setAddress] = useState(previous?.address ?? "");
  const [docType, setDocType] = useState<DocumentType | null>(previous?.document_type ?? null);
  const [docNumber, setDocNumber] = useState(previous?.document_number ?? "");
  const [front, setFront] = useState<PickedFile | null>(null);
  const [back, setBack] = useState<PickedFile | null>(null);
  const [selfie, setSelfie] = useState<PickedFile | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const adultCutoff = new Date();
  adultCutoff.setFullYear(adultCutoff.getFullYear() - 16);

  const validateStep = (which: Step) => {
    const next: Record<string, string | undefined> =
      which === 0
        ? {
            fullName: fullName.trim().length >= 3 ? undefined : "Enter your full legal name.",
            dob: !dob ? "Enter your date of birth." : dob > toISODate(adultCutoff) ? "You must be at least 16 years old." : undefined,
            address: address.trim().length >= 5 ? undefined : "Enter your full address.",
          }
        : which === 1
          ? {
              docType: docType ? undefined : "Choose a document type.",
              docNumber: docNumber.trim().length >= 4 ? undefined : "Enter the document number.",
              front: front ? undefined : "Add a photo of the front of your document.",
              selfie: selfie ? undefined : "Add a clear selfie.",
            }
          : {};
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const next = () => validateStep(step) && setStep((s) => (s + 1) as Step);
  const back_ = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
    else if (onCancel) onCancel();
    else goBack(router, "/account");
  };

  const send = () =>
    submit.mutate(
      { full_name: fullName.trim(), date_of_birth: dob, address: address.trim(), document_type: docType!, document_number: docNumber.trim(), front: front!, back, selfie: selfie! },
      {
        onSuccess: () => {
          toast.success("Documents submitted", "We'll let you know once they're reviewed.");
          onDone();
        },
      }
    );

  return (
    <Screen
      appBar={<AppBar title="Verify your identity" subtitle={`Step ${step + 1} of 3 · ${stepLabels[step]}`} onBack={back_} />}
      footer={
        <View style={[s.footer, atLeastTablet && s.footerWide]}>
          <Button title={step === 0 ? "Cancel" : "Back"} variant="secondary" size="lg" onPress={back_} disabled={submit.isPending} style={s.footerButton} />
          {step < 2 ? (
            <Button title="Continue" size="lg" iconRight="arrow-forward" onPress={next} style={s.footerButton} />
          ) : (
            <Button title="Submit for review" size="lg" icon="shield-checkmark-outline" loading={submit.isPending} onPress={send} style={s.footerButton} />
          )}
        </View>
      }
    >
      <View style={s.steps} accessibilityLabel={`Step ${step + 1} of 3`}>
        {stepLabels.map((label, i) => (
          <View key={label} style={s.stepItem}>
            <View style={[s.stepBar, { backgroundColor: i <= step ? t.colors.primary : t.colors.surfaceMuted }]} />
            <Text variant="caption" tone={i === step ? "default" : "subtle"} numberOfLines={1}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {submit.error && <Banner tone="danger" title="Submission failed" message={getErrorMessage(submit.error)} />}
      {previous?.rejection_reason && step === 0 && <Banner tone="warning" title="Previous submission was rejected" message={previous.rejection_reason} />}

      {step === 0 && (
        <Card style={s.form}>
          <Text variant="body" tone="muted">
            Enter your details exactly as they appear on your official document.
          </Text>
          <TextField label="Full legal name" value={fullName} onChangeText={setFullName} error={errors.fullName} autoComplete="name" />
          <DateField label="Date of birth" value={dob} onChange={setDob} max={toISODate(new Date())} error={errors.dob} />
          <TextField label="Address" placeholder="Street, ward, municipality, district" value={address} onChangeText={setAddress} error={errors.address} multiline autoComplete="street-address" />
        </Card>
      )}

      {step === 1 && (
        <Card style={s.form}>
          <View style={s.field}>
            <Text variant="smallStrong">Document type</Text>
            <ChipRow wrap>
              {documentTypes.map((d) => (
                <Chip key={d.value} label={d.label} selected={docType === d.value} onPress={() => setDocType(d.value)} />
              ))}
            </ChipRow>
            {errors.docType && (
              <Text variant="small" tone="danger">
                {errors.docType}
              </Text>
            )}
          </View>
          <TextField label="Document number" value={docNumber} onChangeText={setDocNumber} error={errors.docNumber} autoCapitalize="characters" />
          <View style={[s.uploads, atLeastTablet && s.uploadsWide]}>
            <UploadTile label="Front of document" value={front} onChange={setFront} error={errors.front} />
            <UploadTile label="Back of document" optional value={back} onChange={setBack} />
            <UploadTile label="Selfie" value={selfie} onChange={setSelfie} error={errors.selfie} selfie />
          </View>
          <Text variant="small" tone="subtle">
            Use well-lit photos where every corner of the document is visible and the text is readable.
          </Text>
        </Card>
      )}

      {step === 2 && (
        <>
          <Card style={s.details}>
            <DetailList
              items={[
                { label: "Full name", value: fullName.trim() },
                { label: "Date of birth", value: formatDate(dob) },
                { label: "Address", value: address.trim() },
                { label: "Document", value: documentTypes.find((d) => d.value === docType)?.label },
                { label: "Document number", value: docNumber.trim() },
              ]}
            />
          </Card>
          <View style={s.previewRow}>
            {[front, back, selfie].filter(Boolean).map((f, i) => (
              <Image key={i} source={{ uri: f!.uri }} style={s.previewImage} accessibilityLabel="Uploaded photo" />
            ))}
          </View>
          <Text variant="small" tone="muted">
            By submitting, you confirm these details are accurate and the documents belong to you.
          </Text>
        </>
      )}
    </Screen>
  );
}

function UploadTile({ label, value, onChange, error, optional, selfie }: { label: string; value: PickedFile | null; onChange: (f: PickedFile | null) => void; error?: string; optional?: boolean; selfie?: boolean }) {
  const t = useTheme();
  const s = useStyles();

  const pick = async () => {
    try {
      const useCamera = selfie && Platform.OS !== "web";
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return toast.error("Camera access is needed to take a selfie.");
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.7, allowsEditing: !!selfie, aspect: selfie ? [1, 1] : undefined };
      const result = useCamera ? await ImagePicker.launchCameraAsync({ ...options, cameraType: ImagePicker.CameraType.front }) : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets?.[0]) return;
      const a = result.assets[0];
      onChange({ uri: a.uri, name: a.fileName ?? `${label.toLowerCase().replace(/\s+/g, "_")}.jpg`, mimeType: a.mimeType ?? "image/jpeg", file: a.file });
    } catch (e) {
      toast.error(e, "Couldn't open the picker.");
    }
  };

  return (
    <View style={s.uploadWrap}>
      <Pressable
        onPress={pick}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label}: added. Tap to replace` : `Add ${label}`}
        style={(state) => {
          const { hovered, focused } = state as InteractionState;
          return [s.upload, !!error && s.uploadError, hovered && s.uploadHover, focused && s.focused];
        }}
      >
        {value ? (
          <Image source={{ uri: value.uri }} style={s.uploadImage} resizeMode="cover" />
        ) : (
          <View style={s.uploadEmpty}>
            <Icon name={selfie ? "person-circle-outline" : "image-outline"} size={28} tone="subtle" />
            <Text variant="smallStrong" align="center">
              {label}
            </Text>
            <Text variant="caption" tone="subtle">
              {optional ? "Optional" : selfie && Platform.OS !== "web" ? "Take photo" : "Upload photo"}
            </Text>
          </View>
        )}
      </Pressable>
      {value && (
        <View style={s.uploadActions}>
          <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
            {label}
          </Text>
          <Button title="Remove" variant="ghost" size="sm" onPress={() => onChange(null)} />
        </View>
      )}
      {error && (
        <Text variant="small" color={t.colors.danger}>
          {error}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  statusCard: { alignItems: "center", gap: t.space.md, paddingVertical: t.space.xxxl },
  statusIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  icon_success: { backgroundColor: t.colors.successSoft },
  icon_info: { backgroundColor: t.colors.infoSoft },
  icon_danger: { backgroundColor: t.colors.dangerSoft },
  icon_warning: { backgroundColor: t.colors.warningSoft },
  statusText: { maxWidth: 420 },
  details: { paddingVertical: t.space.xs },
  detailsTitle: { paddingTop: t.space.md },
  steps: { flexDirection: "row", gap: t.space.sm },
  stepItem: { flex: 1, gap: 6 },
  stepBar: { height: 4, borderRadius: 2 },
  form: { gap: t.space.lg },
  field: { gap: t.space.sm },
  uploads: { gap: t.space.md },
  uploadsWide: { flexDirection: "row" },
  uploadWrap: { flex: 1, gap: t.space.xs },
  upload: {
    height: 150,
    borderRadius: t.radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: t.colors.borderStrong,
    backgroundColor: t.colors.surfaceMuted,
    overflow: "hidden",
    cursor: "pointer",
  },
  uploadHover: { borderColor: t.colors.primary },
  uploadError: { borderColor: t.colors.danger },
  focused: { outlineColor: t.colors.focus, outlineWidth: 2, outlineStyle: "solid" },
  uploadEmpty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, padding: t.space.md },
  uploadImage: { width: "100%", height: "100%" },
  uploadActions: { flexDirection: "row", alignItems: "center" },
  previewRow: { flexDirection: "row", gap: t.space.sm, flexWrap: "wrap" },
  previewImage: { width: 96, height: 96, borderRadius: t.radius.md, backgroundColor: t.colors.surfaceMuted },
  footer: { flexDirection: "row", gap: t.space.sm },
  footerWide: { justifyContent: "flex-end" },
  footerButton: { flexGrow: 1, flexBasis: 0, maxWidth: 240 },
}));
