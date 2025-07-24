# ZKP for auth

### 1. **Compile the Circuit**

```sh
circom auth.circom --r1cs --wasm --sym -o .
```
- This will generate `auth.r1cs`, `auth.wasm`, and `auth.sym` in the `` directory.

---

### 2. **Powers of Tau Ceremony (Trusted Setup)**

#### a. **Start a new ceremony (if you don't have a .ptau file yet):**
```sh
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
```

#### b. **Contribute to the ceremony:**
```sh
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
```

#### c. **Prepare phase 2:**
```sh
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
```

---

### 3. **Generate the ZKey (Proving and Verification Keys)**

```sh
snarkjs groth16 setup auth.r1cs pot12_final.ptau auth_0000.zkey
snarkjs zkey contribute auth_0000.zkey auth_final.zkey --name="1st Contributor" -v
```

---

### 4. **Export the Verifier Smart Contract**

```sh
snarkjs zkey export solidityverifier auth_final.zkey Verifier.sol
```

---

### 5. **Export the Verification Key (for backend verification)**

```sh
snarkjs zkey export verificationkey auth_final.zkey verification_key.json
```

---

## **Summary Table**

| Step                | Command                                                                                  |
|---------------------|------------------------------------------------------------------------------------------|
| Compile             | `circom auth.circom --r1cs --wasm --sym -o .`                                    |
| New ptau            | `snarkjs powersoftau new bn128 12 pot12_0000.ptau -v`                               |
| Contribute ptau     | `snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v` |
| Prepare phase2      | `snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v`         |
| Setup zkey          | `snarkjs groth16 setup auth.r1cs pot12_final.ptau auth_0000.zkey`            |
| Contribute zkey     | `snarkjs zkey contribute auth_0000.zkey auth_final.zkey --name="1st Contributor" -v` |
| Export verifier     | `snarkjs zkey export solidityverifier auth_final.zkey Verifier.sol`              |
| Export verification | `snarkjs zkey export verificationkey auth_final.zkey verification_key.json`      |

---

**Make sure you have [circom](https://docs.circom.io/getting-started/installation/) and [snarkjs](https://github.com/iden3/snarkjs) installed.**


```shellscript
circom auth.circom --r1cs --wasm --sym -o 
```

```shellscript
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
```

```shellscript
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
```

```shellscript
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
```

```shellscript
snarkjs groth16 setup auth.r1cs pot12_final.ptau auth_0000.zkey
snarkjs zkey contribute auth_0000.zkey auth_final.zkey --name="1st Contributor" -v
```

```shellscript
snarkjs zkey export solidityverifier auth_final.zkey Verifier.sol
```

```shellscript
snarkjs zkey export verificationkey auth_final.zkey verification_key.json
```

---

**Testing in terminal**


## 1. **Prepare Input JSON**

Create a file like `input.json` with your test values.  
Example:
```json
{
  "secret": "12345678901234567890",
  "salt": "98765432109876543210",
  "nullifier": "55555555555555555555",
  "pubCommitment": "12345678901234567890",   // Replace with Poseidon(secret, salt)
  "pubNullifier": "98765432109876543210"     // Replace with Poseidon(secret, nullifier)
}
```
> **Note:** You must compute the correct Poseidon hashes for `pubCommitment` and `pubNullifier` using the same logic as your frontend.

---

## 2. **Generate the Witness**

```sh
node auth_js/generate_witness.js auth_js/auth.wasm input.json witness.wtns
```
- This will create `witness.wtns`.

---

## 3. **Generate the Proof**

```sh
snarkjs groth16 prove auth_final.zkey witness.wtns proof.json public.json
```
- This will create `proof.json` and `public.json`.

---

## 4. **Verify the Proof**

```sh
snarkjs groth16 verify verification_key.json public.json proof.json
```
- If everything is correct, you should see:
  ```
  OK!
  ```

---

## **Summary Table**

| Step                | Command                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------|
| Generate witness    | `node auth_js/generate_witness.js auth_js/auth.wasm input.json witness.wtns` |
| Generate proof      | `snarkjs groth16 prove auth_final.zkey witness.wtns proof.json public.json`  |
| Verify proof        | `snarkjs groth16 verify verification_key.json public.json proof.json`            |

---

**If you need help generating the correct Poseidon hashes for your test JSON, let me know your test values and I can provide the correct public inputs!**

```json
{
  "secret": "12345678901234567890",
  "salt": "98765432109876543210",
  "nullifier": "55555555555555555555",
  "pubCommitment": "12345678901234567890",   // Replace with Poseidon(secret, salt)
  "pubNullifier": "98765432109876543210"     // Replace with Poseidon(secret, nullifier)
}
```

```shellscript
node auth_js/generate_witness.js auth_js/auth.wasm input.json witness.wtns
```

```shellscript
snarkjs groth16 prove auth_final.zkey witness.wtns proof.json public.json
```

```shellscript
snarkjs groth16 verify verification_key.json public.json proof.json
```

```plaintext
  OK!
```