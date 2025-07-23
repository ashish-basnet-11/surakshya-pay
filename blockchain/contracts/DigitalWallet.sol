// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DigitalWallet {
    struct User {
        address userAddress;
        bytes32 zkpHash; // ZKP public hash (e.g., Poseidon/SHA256)
        bool registered;
        uint256 balance;
    }

    mapping(address => User) public users;

    event UserRegistered(address indexed user, bytes32 zkpHash);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    modifier onlyRegistered() {
        require(users[msg.sender].registered, "Not registered");
        _;
    }

    // Register a new user with a ZKP hash
    function registerUser(bytes32 zkpHash) public {
        require(!users[msg.sender].registered, "Already registered");
        users[msg.sender] = User(msg.sender, zkpHash, true, 0);
        emit UserRegistered(msg.sender, zkpHash);
    }

    // Deposit Ether into the wallet
    function deposit() public payable onlyRegistered {
        require(msg.value > 0, "Deposit must be greater than 0");
        users[msg.sender].balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // Withdraw Ether from the wallet
    function withdraw(uint256 amount) public onlyRegistered {
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        users[msg.sender].balance -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    // Transfer funds to another registered user
    function transfer(address to, uint256 amount) public onlyRegistered {
        require(users[to].registered, "Recipient not registered");
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        users[msg.sender].balance -= amount;
        users[to].balance += amount;
        emit Transfer(msg.sender, to, amount);
    }

    // Get the balance of the caller
    function getMyBalance() public view onlyRegistered returns (uint256) {
        return users[msg.sender].balance;
    }

    // Get the ZKP hash of a user (for verification, not for authentication)
    function getUserZkpHash(address user) public view returns (bytes32) {
        require(users[user].registered, "User not registered");
        return users[user].zkpHash;
    }

    // Fallback function to prevent accidental Ether transfers
    receive() external payable {
        revert("Please use the deposit function");
    }
}
