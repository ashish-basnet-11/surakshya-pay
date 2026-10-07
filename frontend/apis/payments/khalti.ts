import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { api } from "@/lib/api";
import { invalidateMoney } from "@/lib/query-client";

export interface KhaltiSettlement {
  pidx: string;
  amount: number;
  tx_hash: string | null;
  new_balance: number;
}

export async function initiateKhaltiPayment(amount: number) {
  return (await api.post<{ pidx: string; payment_url: string }>("/payments/khalti/initiate", { amount })).data;
}

export async function verifyKhaltiPayment(pidx: string) {
  return (await api.post<KhaltiSettlement>("/payments/khalti/verify", { pidx })).data;
}

/** Initiate → pay in Khalti's checkout → verify. The backend credits the wallet on-chain once Khalti confirms. */
export function useKhaltiTopUp() {
  return useMutation({
    mutationFn: async (amount: number) => {
      const { pidx, payment_url } = await initiateKhaltiPayment(amount);
      // Khalti returns to an http page, so the session usually ends with the user closing the browser.
      // Verify either way: the backend asks Khalti whether the payment actually completed.
      await WebBrowser.openAuthSessionAsync(payment_url, Linking.createURL("topup"));
      return verifyKhaltiPayment(pidx);
    },
    // Refresh on failure too: the server may have moved money before erroring.
    onSettled: invalidateMoney,
  });
}
