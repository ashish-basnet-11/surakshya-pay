import { expect } from "chai";
import hre from "hardhat";
import { encodeBytes32String, parseEther } from "ethers"; // ✅ use v6-style helpers

const { ethers } = hre;

describe("DigitalWallet", function () {
  let wallet: any;
  let owner: any;
  let user1: any;
  let user2: any;
  const zkpHash1 = encodeBytes32String("zkp1");
  const zkpHash2 = encodeBytes32String("zkp2");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Wallet = await ethers.getContractFactory("DigitalWallet");
    wallet = await Wallet.deploy();
    await wallet.waitForDeployment();
  });

  it("should register users", async function () {
    await expect(wallet.connect(user1).registerUser(zkpHash1))
      .to.emit(wallet, "UserRegistered")
      .withArgs(user1.address, zkpHash1);

    const user = await wallet.users(user1.address);
    expect(user.registered).to.be.true;
    expect(user.zkpHash).to.equal(zkpHash1);
  });

  it("should not allow double registration", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await expect(wallet.connect(user1).registerUser(zkpHash1)).to.be.revertedWith("Already registered");
  });

  it("should deposit and update balance", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await expect(wallet.connect(user1).deposit({ value: parseEther("1") }))
      .to.emit(wallet, "Deposit")
      .withArgs(user1.address, parseEther("1"));

    const user = await wallet.users(user1.address);
    expect(user.balance).to.equal(parseEther("1"));
  });

  it("should not allow deposit from unregistered user", async function () {
    await expect(wallet.connect(user1).deposit({ value: parseEther("1") }))
      .to.be.revertedWith("Not registered");
  });

  it("should withdraw funds", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await wallet.connect(user1).deposit({ value: parseEther("1") });

    await expect(wallet.connect(user1).withdraw(parseEther("0.5")))
      .to.emit(wallet, "Withdrawal")
      .withArgs(user1.address, parseEther("0.5"));

    const user = await wallet.users(user1.address);
    expect(user.balance).to.equal(parseEther("0.5"));
  });

  it("should not allow withdrawal of more than balance", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await wallet.connect(user1).deposit({ value: parseEther("1") });

    await expect(wallet.connect(user1).withdraw(parseEther("2")))
      .to.be.revertedWith("Insufficient balance");
  });

  it("should transfer funds between users", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await wallet.connect(user2).registerUser(zkpHash2);
    await wallet.connect(user1).deposit({ value: parseEther("1") });

    await expect(wallet.connect(user1).transfer(user2.address, parseEther("0.4")))
      .to.emit(wallet, "Transfer")
      .withArgs(user1.address, user2.address, parseEther("0.4"));

    const user1Data = await wallet.users(user1.address);
    const user2Data = await wallet.users(user2.address);
    expect(user1Data.balance).to.equal(parseEther("0.6"));
    expect(user2Data.balance).to.equal(parseEther("0.4"));
  });

  it("should not allow transfer to unregistered user", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await wallet.connect(user1).deposit({ value: parseEther("1") });

    await expect(wallet.connect(user1).transfer(user2.address, parseEther("0.1")))
      .to.be.revertedWith("Recipient not registered");
  });

  it("should return correct ZKP hash", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    expect(await wallet.getUserZkpHash(user1.address)).to.equal(zkpHash1);
  });
});
