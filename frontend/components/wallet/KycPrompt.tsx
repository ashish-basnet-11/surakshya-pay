import { useRouter } from "expo-router";
import { Banner, Button } from "@/components/ui";

/** Nudge shown until identity verification is approved. */
export function KycPrompt({ status }: { status?: string | null }) {
  const router = useRouter();
  if (status === "approved") return null;
  const copy =
    status === "pending"
      ? { tone: "info" as const, title: "Verification in review", message: "We'll notify you once your documents are approved." }
      : status === "rejected" || status === "resubmit_required"
        ? { tone: "danger" as const, title: "Verification needs attention", message: "Your documents were not approved. Review the reason and resubmit." }
        : { tone: "warning" as const, title: "Verify your identity", message: "Complete KYC to keep your wallet fully secured and accountable." };
  return (
    <Banner
      {...copy}
      action={status === "pending" ? undefined : <Button title={status ? "Review" : "Verify"} size="sm" variant="secondary" onPress={() => router.push("/kyc")} />}
    />
  );
}
