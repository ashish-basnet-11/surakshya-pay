import type { Transaction } from "@/types/transaction";

export type Direction = "in" | "out";

/**
 * Transfers create one row for each party with the same from/to addresses,
 * so direction comes from comparing the sender address with our wallet.
 */
export function getDirection(tx: Pick<Transaction, "transaction_type" | "description"> & Partial<Pick<Transaction, "from_address">>, wallet?: string | null): Direction {
  const type = tx.transaction_type?.toUpperCase();
  if (type === "DEPOSIT" || type === "RELEASE") return "in";
  if (type === "WITHDRAWAL" || type === "WITHDRAW" || type === "SAVE") return "out";
  if (tx.from_address && wallet) return tx.from_address.toLowerCase() === wallet.toLowerCase() ? "out" : "in";
  return tx.description?.toLowerCase().startsWith("received") ? "in" : "out";
}

export type TxKind = "transfer" | "topup" | "withdrawal" | "savings";
const KINDS: Record<string, TxKind> = { TRANSFER: "transfer", DEPOSIT: "topup", WITHDRAWAL: "withdrawal", WITHDRAW: "withdrawal", SAVE: "savings", RELEASE: "savings" };

export interface TxFilter {
  q?: string;
  direction?: Direction | "all";
  kind?: TxKind | "all";
  /** Epoch ms, inclusive. */
  from?: number | null;
  /** Epoch ms, exclusive. */
  to?: number | null;
}

type Filterable = Pick<Transaction, "transaction_type" | "description" | "amount" | "category" | "timestamp"> & Partial<Pick<Transaction, "from_address" | "blockchain_hash">>;

/** Search matches description (peer username, goal name, "Khalti"), category, amount and tx hash. */
export function filterTransactions<T extends Filterable>(list: T[], f: TxFilter, wallet?: string | null): T[] {
  const q = f.q?.trim().toLowerCase().replace(/,/g, "");
  return list.filter((tx) => {
    if (f.direction && f.direction !== "all" && getDirection(tx, wallet) !== f.direction) return false;
    if (f.kind && f.kind !== "all" && KINDS[tx.transaction_type?.toUpperCase()] !== f.kind) return false;
    if (f.from != null || f.to != null) {
      // Backend timestamps are naive UTC (same rule as parseDate).
      const t = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(tx.timestamp) ? tx.timestamp : `${tx.timestamp}Z`);
      if ((f.from != null && t < f.from) || (f.to != null && t >= f.to)) return false;
    }
    if (q) {
      const hay = [tx.description, tx.category, String(Math.abs(tx.amount)), tx.blockchain_hash].join(" ").toLowerCase();
      if (!q.split(/\s+/).every((word) => hay.includes(word))) return false;
    }
    return true;
  });
}
