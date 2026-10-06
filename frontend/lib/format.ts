export function toNumber(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(value: string | number | null | undefined, { sign = false } = {}): string {
  const n = toNumber(value);
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const prefix = sign ? (n > 0 ? "+" : n < 0 ? "−" : "") : n < 0 ? "−" : "";
  return `${prefix}NPR ${abs}`;
}

export function formatCompact(value: number): string {
  return value.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });
}

/** Backend timestamps are naive UTC; treat them as such. */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const hasZone = /[zZ]|[+-]\d\d:?\d\d$/.test(value);
  const d = new Date(hasZone || value.length <= 10 ? value : `${value}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: string | null | undefined, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  const d = parseDate(value);
  return d ? new Intl.DateTimeFormat("en-US", opts).format(d) : "—";
}

export function formatDateTime(value: string | null | undefined) {
  return formatDate(value, { dateStyle: "medium", timeStyle: "short" });
}

export function formatTime(value: string | null | undefined) {
  return formatDate(value, { timeStyle: "short" });
}

export function formatRelative(value: string | null | undefined): string {
  const d = parseDate(value);
  if (!d) return "—";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(value);
}

/** "Today", "Yesterday" or a date — used to group lists. */
export function dayLabel(value: string | null | undefined): string {
  const d = parseDate(value);
  if (!d) return "Earlier";
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((start(new Date()) - start(d)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(d);
}

export function initials(name?: string | null, fallback = "?"): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function shortAddress(address?: string | null, size = 6) {
  if (!address) return "—";
  return address.length <= size * 2 + 3 ? address : `${address.slice(0, size)}…${address.slice(-4)}`;
}

export function titleCase(value?: string | null) {
  return (value ?? "").replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
