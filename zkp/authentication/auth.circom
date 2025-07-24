pragma circom 2.0.0;

include "../circomlib/circuits/poseidon.circom";

// This circuit proves knowledge of a secret and salt such that:
// Poseidon(secret, salt) == pubCommitment
// Poseidon(secret, nullifier) == pubNullifier

template Auth() {
    // Private inputs
    signal input secret;         // keccak256(password) as BigInt
    signal input salt;           // random salt as BigInt
    signal input nullifier;      // random nullifier as BigInt

    // Public inputs
    signal input pubCommitment;  // Poseidon(secret, salt)
    signal input pubNullifier;   // Poseidon(secret, nullifier)

    // Intermediate hash components
    component poseidonCommit = Poseidon(2);
    poseidonCommit.inputs[0] <== secret;
    poseidonCommit.inputs[1] <== salt;

    component poseidonNullifier = Poseidon(2);
    poseidonNullifier.inputs[0] <== secret;
    poseidonNullifier.inputs[1] <== nullifier;

    // Constraints
    poseidonCommit.out === pubCommitment;
    poseidonNullifier.out === pubNullifier;
}

component main = Auth();
