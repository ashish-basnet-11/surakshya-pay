/**
 * Deploy DigitalWallet and point the backend at it.
 *   npm run deploy            (Ganache on 127.0.0.1:7545)
 * Writes the new ABI to backend/app/utils/digital_wallet.json and CONTRACT_ADDRESS to backend/.env,
 * then prints the command that moves existing users and balances onto the new contract.
 */
import fs from "fs";
import path from "path";
import hre from "hardhat";

const backend = process.env.BACKEND_DIR ?? path.resolve(__dirname, "../../backend");
const envPath = path.join(backend, ".env");

async function main() {
  const wallet = await hre.ethers.deployContract("DigitalWallet");
  await wallet.waitForDeployment();
  const address = await wallet.getAddress();
  console.log(`DigitalWallet deployed to ${address} on ${hre.network.name}`);

  const artifact = await hre.artifacts.readArtifact("DigitalWallet");
  fs.writeFileSync(path.join(backend, "app/utils/digital_wallet.json"), JSON.stringify(artifact, null, 2) + "\n");
  console.log("Updated backend/app/utils/digital_wallet.json");

  if (!fs.existsSync(envPath)) {
    console.log(`No backend/.env found. Set CONTRACT_ADDRESS=${address} yourself.`);
    return;
  }
  const env = fs.readFileSync(envPath, "utf8");
  const old = env.match(/^CONTRACT_ADDRESS=(.*)$/m)?.[1]?.trim();
  const next = old !== undefined ? env.replace(/^CONTRACT_ADDRESS=.*$/m, `CONTRACT_ADDRESS=${address}`) : `${env.trimEnd()}\nCONTRACT_ADDRESS=${address}\n`;
  fs.writeFileSync(envPath, next);
  console.log(`Updated backend/.env CONTRACT_ADDRESS: ${old || "(none)"} -> ${address}`);

  if (old && old.toLowerCase() !== address.toLowerCase()) {
    console.log("\nNext: stop the backend, then move users and balances to the new contract:");
    console.log(`  cd ../backend && venv/Scripts/python -m scripts.migrate_contract ${old}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
