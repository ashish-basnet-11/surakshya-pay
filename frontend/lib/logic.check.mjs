// Self-check for the money/validation logic. Run: node lib/logic.check.mjs
import assert from "node:assert/strict";
import { filterTransactions, getDirection } from "./direction.ts";
import { formatMoney, initials, parseDate } from "./format.ts";
import { isEmail, isPhone, isStrongPassword, parseAmount, sanitizeAmountInput } from "./validation.ts";

// Amounts: positive, at most 2 decimals, commas tolerated.
assert.equal(parseAmount("120"), 120);
assert.equal(parseAmount("1,250.50"), 1250.5);
assert.ok(Number.isNaN(parseAmount("")));
assert.ok(Number.isNaN(parseAmount("1.234")));
assert.ok(Number.isNaN(parseAmount("-5")));
assert.ok(Number.isNaN(parseAmount("12abc")));
assert.equal(sanitizeAmountInput("12a.3.45"), "12.34");
assert.equal(sanitizeAmountInput("0012345678901"), "001234567");
// Wallet amounts are whole rupees (decimals = 0), matching the ledger contract.
assert.equal(parseAmount("50", 0), 50);
assert.ok(Number.isNaN(parseAmount("50.5", 0)));
assert.equal(sanitizeAmountInput("12.75", 0), "1275");

// Formatting.
assert.equal(formatMoney(1234.5), "NPR 1,234.50");
assert.equal(formatMoney("-20"), "−NPR 20.00");
assert.equal(formatMoney(20, { sign: true }), "+NPR 20.00");
assert.equal(formatMoney(undefined), "NPR 0.00");
assert.equal(initials("Sita Kumari Sharma"), "SS");
assert.equal(initials("  "), "?");
assert.equal(parseDate("2026-10-06T10:00:00")?.toISOString(), "2026-10-06T10:00:00.000Z"); // naive = UTC

// Validation.
assert.ok(isEmail("a@b.co") && !isEmail("a@b") && !isEmail("a b@c.com"));
assert.ok(isPhone("98-0000-0001") && isPhone("+9779800000001") && !isPhone("12"));
assert.ok(isStrongPassword("ashish123") && !isStrongPassword("short1") && !isStrongPassword("lettersonly"));

// Direction: both parties' transfer rows share from/to, so the sender address decides.
const me = "0xAbC";
assert.equal(getDirection({ transaction_type: "DEPOSIT", description: "" }, me), "in");
assert.equal(getDirection({ transaction_type: "WITHDRAWAL", description: "" }, me), "out");
assert.equal(getDirection({ transaction_type: "SAVE", description: "Saved 5 NPR to Trip" }, me), "out");
assert.equal(getDirection({ transaction_type: "RELEASE", description: "Moved 5 NPR back from Trip" }, me), "in");
assert.equal(getDirection({ transaction_type: "TRANSFER", description: "Transfer of 5 NPR to bob", from_address: "0xabc" }, me), "out");
assert.equal(getDirection({ transaction_type: "TRANSFER", description: "Received 5 NPR from bob", from_address: "0xdef" }, me), "in");
assert.equal(getDirection({ transaction_type: "TRANSFER", description: "Received 5 NPR from bob" }, null), "in");

// Filtering: search words AND together; kind, direction and date range combine.
const txs = [
  { id: 1, transaction_type: "TRANSFER", description: "Transfer of 1500 NPR to bob", category: "food", amount: 1500, timestamp: "2026-10-01T10:00:00", from_address: "0xabc", blockchain_hash: "0xDEAD" },
  { id: 2, transaction_type: "TRANSFER", description: "Received 20 NPR from alice", category: "transfer", amount: 20, timestamp: "2026-10-05T10:00:00", from_address: "0xdef" },
  { id: 3, transaction_type: "DEPOSIT", description: "Khalti top-up of 500 NPR (pidx x)", category: "deposit", amount: 500, timestamp: "2026-10-09T10:00:00" },
  { id: 4, transaction_type: "SAVE", description: "Saved 50 NPR to Trip", category: "savings", amount: 50, timestamp: "2026-10-10T10:00:00" },
];
const ids = (f) => filterTransactions(txs, f, me).map((t) => t.id);
assert.deepEqual(ids({}), [1, 2, 3, 4]);
assert.deepEqual(ids({ q: "bob" }), [1]);
assert.deepEqual(ids({ q: "1,500" }), [1]);
assert.deepEqual(ids({ q: "dead" }), [1]);
assert.deepEqual(ids({ q: "khalti 500" }), [3]);
assert.deepEqual(ids({ q: "khalti bob" }), []);
assert.deepEqual(ids({ direction: "in" }), [2, 3]);
assert.deepEqual(ids({ kind: "transfer", direction: "out" }), [1]);
assert.deepEqual(ids({ kind: "savings" }), [4]);
assert.deepEqual(ids({ from: Date.parse("2026-10-05T00:00:00Z"), to: Date.parse("2026-10-10T00:00:00Z") }), [2, 3]);

console.log("logic checks passed");
