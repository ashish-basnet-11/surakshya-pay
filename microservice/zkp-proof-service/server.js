import express from "express";
import fs from "fs";
import { exec } from "child_process";
import { generateZkpFields } from "./utils/zkpFields.js";

const app = express();
app.use(express.json());

app.post("/get-zkp-fields", async (req, res) => {
  try {
    const { secret } = req.body;

    if (!secret) return res.status(400).json({ error: "Secret is required" });

    const zkpFields = await generateZkpFields(secret);

    return res.json(zkpFields);
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.post("/generate-proof-and-verify", async (req, res) => {
  try {
    const { secret, salt, nullifier } = req.body;

    if (!secret) return res.status(400).json({ error: "Secret is required" });

    const {
      secret_int,
      salt : salt_hex,
      nullifier: nullifier_hex,
      zkp_commitment,
      zkp_nullifier,
    } = await generateZkpFields(secret, salt, nullifier);

    const input = {
      secret: secret_int,
      salt: salt_hex,
      nullifier:nullifier_hex,
      pubCommitment: zkp_commitment,
      pubNullifier: zkp_nullifier,
    };

    const inputPath = "./proofs/input.json";
    const witnessPath = "./circuits/witness.wtns";
    const proofPath = "./proofs/proof.json";
    const publicPath = "./proofs/public.json";

    fs.writeFileSync(inputPath, JSON.stringify(input));

    exec(
      `node ./circuits/generate_witness.js ./circuits/auth.wasm ${inputPath} ${witnessPath}`,
      (witnessErr) => {
        if (witnessErr) {
          console.error("Witness generation failed:", witnessErr);
          return res.status(500).json({ error: "Witness generation failed" });
        }

        exec(
          `npx snarkjs groth16 prove ./circuits/auth_final.zkey ${witnessPath} ${proofPath} ${publicPath}`,
          (proveErr) => {
            if (proveErr) {
              console.error("Proof generation failed:", proveErr);
              return res.status(500).json({ error: "Proof generation failed" });
            }

            exec(
              `npx snarkjs groth16 verify ./circuits/verification_key.json ${publicPath} ${proofPath}`,
              (verifyErr, stdout, stderr) => {
                if (verifyErr) {
                  console.error("Verification failed:", verifyErr);
                  return res.status(500).json({ error: "Verification failed" });
                }

                try {
                  const proof = JSON.parse(fs.readFileSync(proofPath, "utf-8"));
                    const publicSignals = JSON.parse(
                      fs.readFileSync(publicPath, "utf-8")
                    );
  
                    res.json({
                      zkp_commitment,
                      proof,
                      publicSignals,
                      zkp_nullifier: nullifier_hex,
                      verified: stdout.toLowerCase().includes("ok")
                    });

                  [inputPath, witnessPath, proofPath, publicPath].forEach(
                    (file) => {
                      if (fs.existsSync(file)) {
                        fs.unlinkSync(file);
                      }
                    }
                  );
                } catch (readErr) {
                  console.error("File read or cleanup failed:", readErr);
                  res
                    .status(500)
                    .json({ error: "Failed to read generated proof files" });
                }
              }
            );
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message || "Proof generation error" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`ZKP Proof Service running at http://localhost:${PORT}`);
});
