import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DigitalWalletModule = buildModule("DigitalWalletModule", (m) => {
  const digitalWallet = m.contract("DigitalWallet", []);
  return { digitalWallet };
});

export default DigitalWalletModule;
