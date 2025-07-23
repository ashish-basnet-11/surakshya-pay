pragma circom 2.0.0;

include "circomlib/poseidon.circom";

template Auth() {
    // Private input: the secret (e.g., fingerprint hash or password hash)
    signal input secret;

    // Public input: the expected hash
    signal input pubHash;

    // Compute the Poseidon hash of the secret
    signal hash;
    hash <== Poseidon([secret]);

    // Enforce that the computed hash matches the public hash
    pubHash === hash;
}

component main = Auth();