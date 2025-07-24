pragma circom 2.1.4;

include "../circomlib/circuits/poseidon.circom";

template Transaction() {
    // === PRIVATE INPUTS ===
    signal input priv_key;         // User's private key or secret
    signal input amount;           // Amount being transacted
    signal input salt;             // Random salt to make commitment unique

    // === PUBLIC INPUTS ===
    signal input nullifierHash;    // Public nullifier to prevent double spend
    signal output commitment;      // UTXO commitment (can be stored externally)
    signal output computedNullifier;

    // === COMMITMENT = Poseidon(priv_key, amount, salt) ===
    component commitmentHasher = Poseidon(3);
    commitmentHasher.inputs[0] <== priv_key;
    commitmentHasher.inputs[1] <== amount;
    commitmentHasher.inputs[2] <== salt;
    commitment <== commitmentHasher.out;

    // === NULLIFIER = Poseidon(priv_key, commitment) ===
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== priv_key;
    nullifierHasher.inputs[1] <== commitment;
    computedNullifier <== nullifierHasher.out;

    // === PUBLIC CHECK ===
    computedNullifier === nullifierHash;
}

component main = Transaction();
