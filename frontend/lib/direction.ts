import type { Transaction } from "@/types/transaction";

export type Direction = "in" | "out";

/**
 * Transfers create one row for each party with the same from/to addresses,
 * so direction comes from comparing the sender address with our wallet.
 */
export function getDirection(tx: Pick<Transaction, "transaction_type" | "description"> & Partial<Pick<Transaction, "from_address">>, wallet?: string | null): Direction {
  const type = tx.transaction_type?.toUpperCase();
  if (type === "DEPOSIT") return "in";
  if (type === "WITHDRAWAL" || type === "WITHDRAW") return "out";
  if (tx.from_address && wallet) return tx.from_address.toLowerCase() === wallet.toLowerCase() ? "out" : "in";
  return tx.description?.toLowerCase().startsWith("received") ? "in" : "out";
}
