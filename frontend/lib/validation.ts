export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const isPhone = (v: string) => /^\+?\d{7,15}$/.test(v.replace(/[\s-]/g, ""));

export const passwordRules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Contains a letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "Contains a number", test: (v: string) => /\d/.test(v) },
];

export const isStrongPassword = (v: string) => passwordRules.every((r) => r.test(v));

/**
 * Parse a user-typed amount; NaN unless it's a positive number with at most `decimals` decimals.
 * Wallet amounts are whole rupees (the ledger contract stores integers), so they use decimals = 0.
 */
export function parseAmount(v: string, decimals = 2): number {
  const clean = v.replace(/,/g, "").trim();
  const pattern = decimals > 0 ? new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`) : /^\d+$/;
  if (!pattern.test(clean)) return NaN;
  return Number(clean);
}

/** Keep only digits (and, if allowed, one decimal point with at most `decimals` places) while typing. */
export function sanitizeAmountInput(v: string, decimals = 2): string {
  const cleaned = v.replace(decimals > 0 ? /[^\d.]/g : /\D/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (!rest.length || decimals === 0) return whole.slice(0, 9);
  return `${whole.slice(0, 9)}.${rest.join("").slice(0, decimals)}`;
}
