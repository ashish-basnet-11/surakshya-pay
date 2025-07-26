// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DigitalWallet {
    struct User {
        address userAddress;
        bytes32 zkpHash;
        bool registered;
        uint256 balance;
    }

    struct Transaction {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        TransactionType transactionType;
        bool isCompleted;
    }

    enum TransactionType {
        DEPOSIT,
        WITHDRAWAL,
        TRANSFER
    }

    mapping(address => User) public users;
    mapping(address => uint256[]) public userTransactionIds;
    mapping(uint256 => Transaction) public transactions;

    uint256 private transactionCounter = 0;

    event UserRegistered(address indexed user, bytes32 zkpHash);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event TransactionCreated(uint256 indexed transactionId, address indexed from, address indexed to, uint256 amount, TransactionType transactionType);

    modifier onlyRegistered() {
        require(users[msg.sender].registered, "Not registered");
        _;
    }

    function registerUser(bytes32 zkpHash) public {
        require(!users[msg.sender].registered, "Already registered");
        users[msg.sender] = User(msg.sender, zkpHash, true, 0);
        emit UserRegistered(msg.sender, zkpHash);
    }

    function deposit(uint256 amount) public onlyRegistered {
        require(amount > 0, "Deposit must be greater than 0");
        users[msg.sender].balance += amount;
        
        // Create transaction record
        uint256 transactionId = _createTransaction(msg.sender, address(0), amount, TransactionType.DEPOSIT);
        
        emit Deposit(msg.sender, amount);
        emit TransactionCreated(transactionId, msg.sender, address(0), amount, TransactionType.DEPOSIT);
    }

    // Withdraw Ether from the wallet
    function withdraw(uint256 amount) public onlyRegistered {
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        users[msg.sender].balance -= amount;
        
        // Create transaction record
        uint256 transactionId = _createTransaction(msg.sender, address(0), amount, TransactionType.WITHDRAWAL);
        
        emit Withdrawal(msg.sender, amount);
        emit TransactionCreated(transactionId, msg.sender, address(0), amount, TransactionType.WITHDRAWAL);
    }

    // Transfer funds to another registered user
    function transfer(address to, uint256 amount) public onlyRegistered {
        require(users[to].registered, "Recipient not registered");
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        users[msg.sender].balance -= amount;
        users[to].balance += amount;
        
        // Create transaction record
        uint256 transactionId = _createTransaction(msg.sender, to, amount, TransactionType.TRANSFER);
        
        emit Transfer(msg.sender, to, amount);
        emit TransactionCreated(transactionId, msg.sender, to, amount, TransactionType.TRANSFER);
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

    // Get transaction by ID
    function getTransaction(uint256 transactionId) public view returns (
        uint256 id,
        address from,
        address to,
        uint256 amount,
        uint256 timestamp,
        TransactionType transactionType,
        bool isCompleted
    ) {
        Transaction memory transaction = transactions[transactionId];
        require(transaction.id != 0, "Transaction not found");
        return (
            transaction.id,
            transaction.from,
            transaction.to,
            transaction.amount,
            transaction.timestamp,
            transaction.transactionType,
            transaction.isCompleted
        );
    }

    // Get all transactions for a user
    function getUserTransactions(address user) public view returns (uint256[] memory) {
        require(users[user].registered, "User not registered");
        return userTransactionIds[user];
    }

    // Get user's transaction count
    function getUserTransactionCount(address user) public view returns (uint256) {
        require(users[user].registered, "User not registered");
        return userTransactionIds[user].length;
    }

    // Get paginated transactions for a user
    function getUserTransactionsPaginated(address user, uint256 offset, uint256 limit) public view returns (uint256[] memory) {
        require(users[user].registered, "User not registered");
        uint256[] memory allTransactions = userTransactionIds[user];
        uint256 totalTransactions = allTransactions.length;
        
        if (offset >= totalTransactions) {
            return new uint256[](0);
        }
        
        uint256 endIndex = offset + limit;
        if (endIndex > totalTransactions) {
            endIndex = totalTransactions;
        }
        
        uint256 resultLength = endIndex - offset;
        uint256[] memory result = new uint256[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allTransactions[offset + i];
        }
        
        return result;
    }

    // Get recent transactions for a user (last N transactions)
    function getRecentTransactions(address user, uint256 count) public view returns (uint256[] memory) {
        require(users[user].registered, "User not registered");
        uint256[] memory allTransactions = userTransactionIds[user];
        uint256 totalTransactions = allTransactions.length;
        
        if (count > totalTransactions) {
            count = totalTransactions;
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = allTransactions[totalTransactions - count + i];
        }
        
        return result;
    }

    // Get transactions by type for a user
    function getUserTransactionsByType(address user, TransactionType transactionType) public view returns (uint256[] memory) {
        require(users[user].registered, "User not registered");
        uint256[] memory allTransactions = userTransactionIds[user];
        uint256[] memory tempResult = new uint256[](allTransactions.length);
        uint256 resultCount = 0;
        
        for (uint256 i = 0; i < allTransactions.length; i++) {
            if (transactions[allTransactions[i]].transactionType == transactionType) {
                tempResult[resultCount] = allTransactions[i];
                resultCount++;
            }
        }
        
        uint256[] memory result = new uint256[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = tempResult[i];
        }
        
        return result;
    }

    // Internal function to create a transaction record
    function _createTransaction(address from, address to, uint256 amount, TransactionType transactionType) internal returns (uint256) {
        transactionCounter++;
        uint256 transactionId = transactionCounter;
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            transactionType: transactionType,
            isCompleted: true
        });
        
        userTransactionIds[from].push(transactionId);
        if (to != address(0)) {
            userTransactionIds[to].push(transactionId);
        }
        
        return transactionId;
    }

    // Fallback function to prevent accidental Ether transfers
    receive() external payable {
        revert("Please use the deposit function");
    }
}
