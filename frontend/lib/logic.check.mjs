// Self-check for the money/validation logic. Run: node lib/logic.check.mjs
import assert from "node:assert/strict";
import { getDirection } from "./direction.ts";
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
assert.equal(getDirection({ transaction_type: "TRANSFER", description: "Transfer of 5 NPR to bob", from_address: "0xabc" }, me), "out");
assert.equal(getDirection({ transaction_type: "TRANSFER", description: "Received 5 NPR from bob", from_address: "0xdef" }, me), "in");
assert.equal(getDirection({ transaction_type: "TRANSFER", description: "Received 5 NPR from bob" }, null), "in");

console.log("logic checks passed");
