import { expect } from "chai";
import hre from "hardhat";
import { encodeBytes32String } from "ethers";

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
    await expect(wallet.connect(user1).deposit(100))
      .to.emit(wallet, "Deposit")
      .withArgs(user1.address, 100);

    const user = await wallet.users(user1.address);
    expect(user.balance).to.equal(100);
  });

  it("should not allow deposit from unregistered user", async function () {
    await expect(wallet.connect(user1).deposit(100))
      .to.be.revertedWith("Not registered");
  });

  it("should withdraw funds", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await wallet.connect(user1).deposit(100);

    await expect(wallet.connect(user1).withdraw(50))
      .to.emit(wallet, "Withdrawal")
      .withArgs(user1.address, 50);

    const user = await wallet.users(user1.address);
    expect(user.balance).to.equal(50);
  });

  it("should not allow withdrawal of more than balance", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await wallet.connect(user1).deposit(100);

    await expect(wallet.connect(user1).withdraw(200))
      .to.be.revertedWith("Insufficient balance");
  });

  it("should transfer funds between users", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await wallet.connect(user2).registerUser(zkpHash2);
    await wallet.connect(user1).deposit(100);

    await expect(wallet.connect(user1).transfer(user2.address, 40))
      .to.emit(wallet, "Transfer")
      .withArgs(user1.address, user2.address, 40);

    const user1Data = await wallet.users(user1.address);
    const user2Data = await wallet.users(user2.address);
    expect(user1Data.balance).to.equal(60);
    expect(user2Data.balance).to.equal(40);
  });

  it("should not allow transfer to unregistered user", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    await wallet.connect(user1).deposit(100);

    await expect(wallet.connect(user1).transfer(user2.address, 10))
      .to.be.revertedWith("Recipient not registered");
  });

  it("should return correct ZKP hash", async function () {
    await wallet.connect(user1).registerUser(zkpHash1);
    expect(await wallet.getUserZkpHash(user1.address)).to.equal(zkpHash1);
  });

  describe("savings goals", function () {
    const GOAL = 7;

    beforeEach(async function () {
      await wallet.connect(user1).registerUser(zkpHash1);
      await wallet.connect(user1).deposit(100);
    });

    it("locks money in a goal and out of the spendable balance", async function () {
      await expect(wallet.connect(user1).saveToGoal(GOAL, 30)).to.emit(wallet, "SavedToGoal").withArgs(user1.address, GOAL, 30);
      expect(await wallet.connect(user1).getMyBalance()).to.equal(70);
      expect(await wallet.connect(user1).getGoalBalance(GOAL)).to.equal(30);
      expect(await wallet.connect(user1).getMySavings()).to.equal(30);
      expect(await wallet.connect(user1).getGoalBalance(GOAL + 1)).to.equal(0);
    });

    it("can't spend locked money", async function () {
      await wallet.connect(user1).saveToGoal(GOAL, 80);
      await expect(wallet.connect(user1).withdraw(30)).to.be.revertedWith("Insufficient balance");
      await wallet.connect(user2).registerUser(zkpHash2);
      await expect(wallet.connect(user1).transfer(user2.address, 30)).to.be.revertedWith("Insufficient balance");
    });

    it("can't save more than the spendable balance or zero", async function () {
      await expect(wallet.connect(user1).saveToGoal(GOAL, 101)).to.be.revertedWith("Insufficient balance");
      await expect(wallet.connect(user1).saveToGoal(GOAL, 0)).to.be.revertedWith("Amount must be greater than 0");
    });

    it("releases money back to the spendable balance", async function () {
      await wallet.connect(user1).saveToGoal(GOAL, 30);
      await expect(wallet.connect(user1).releaseFromGoal(GOAL, 10)).to.emit(wallet, "ReleasedFromGoal").withArgs(user1.address, GOAL, 10);
      expect(await wallet.connect(user1).getMyBalance()).to.equal(80);
      expect(await wallet.connect(user1).getGoalBalance(GOAL)).to.equal(20);
      expect(await wallet.connect(user1).getMySavings()).to.equal(20);
      await expect(wallet.connect(user1).releaseFromGoal(GOAL, 21)).to.be.revertedWith("Insufficient goal balance");
    });

    it("keeps goals separate per user", async function () {
      await wallet.connect(user1).saveToGoal(GOAL, 30);
      await wallet.connect(user2).registerUser(zkpHash2);
      expect(await wallet.connect(user2).getGoalBalance(GOAL)).to.equal(0);
      await expect(wallet.connect(user2).releaseFromGoal(GOAL, 1)).to.be.revertedWith("Insufficient goal balance");
    });

    it("records SAVE and RELEASE transactions", async function () {
      await wallet.connect(user1).saveToGoal(GOAL, 30);
      await wallet.connect(user1).releaseFromGoal(GOAL, 30);
      const ids = await wallet.getUserTransactions(user1.address);
      const types = await Promise.all(ids.map(async (id: bigint) => (await wallet.getTransaction(id)).transactionType));
      expect(types).to.deep.equal([0n, 3n, 4n]); // DEPOSIT, SAVE, RELEASE
    });
  });
});
