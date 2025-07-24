const { buildPoseidon } = require("circomlibjs");
const fs = require("fs");

async function main() {
  // Example values (replace with your own for real tests)
  const priv_key = "123";
  const amount = "100";
  const salt = "456";

  // Convert to BigInt
  const privKeyBigInt = BigInt(priv_key);
  const amountBigInt = BigInt(amount);
  const saltBigInt = BigInt(salt);

  // Build Poseidon hash function
  const poseidon = await buildPoseidon();

  // Compute commitment: Poseidon(priv_key, amount, salt)
  const commitment = poseidon.F.toObject(
    poseidon([privKeyBigInt, amountBigInt, saltBigInt])
  );

  // Compute nullifier: Poseidon(priv_key, commitment)
  const computedNullifier = poseidon.F.toObject(
    poseidon([privKeyBigInt, commitment])
  );

  // Prepare input object
  const input = {
    priv_key: privKeyBigInt.toString(),
    amount: amountBigInt.toString(),
    salt: saltBigInt.toString(),
    nullifierHash: computedNullifier.toString()
    // commitment and computedNullifier are circuit outputs, not inputs
  };

  // Write to file
  console.log("input.json generated:", input);
}

main();