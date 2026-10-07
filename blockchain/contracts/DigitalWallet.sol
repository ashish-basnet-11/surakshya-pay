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
        TRANSFER,
        SAVE,       // spendable balance -> savings goal
        RELEASE     // savings goal -> spendable balance
    }

    mapping(address => User) public users;
    mapping(address => uint256[]) public userTransactionIds;
    mapping(uint256 => Transaction) public transactions;

    uint256 private transactionCounter = 0;

    // Savings goals: money locked per goal (goalId = the app's budget id), not spendable until released.
    mapping(address => mapping(uint256 => uint256)) public goalBalances;
    mapping(address => uint256) public totalSaved;

    event UserRegistered(address indexed user, bytes32 zkpHash);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event SavedToGoal(address indexed user, uint256 indexed goalId, uint256 amount);
    event ReleasedFromGoal(address indexed user, uint256 indexed goalId, uint256 amount);
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
        
        uint256 transactionId = _createTransaction(msg.sender, address(0), amount, TransactionType.DEPOSIT);
        
        emit Deposit(msg.sender, amount);
        emit TransactionCreated(transactionId, msg.sender, address(0), amount, TransactionType.DEPOSIT);
    }

    function withdraw(uint256 amount) public onlyRegistered {
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        users[msg.sender].balance -= amount;
        
        uint256 transactionId = _createTransaction(msg.sender, address(0), amount, TransactionType.WITHDRAWAL);
        
        emit Withdrawal(msg.sender, amount);
        emit TransactionCreated(transactionId, msg.sender, address(0), amount, TransactionType.WITHDRAWAL);
    }

    function transfer(address to, uint256 amount) public onlyRegistered {
        require(users[to].registered, "Recipient not registered");
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        users[msg.sender].balance -= amount;
        users[to].balance += amount;
        
        uint256 transactionId = _createTransaction(msg.sender, to, amount, TransactionType.TRANSFER);
        
        emit Transfer(msg.sender, to, amount);
        emit TransactionCreated(transactionId, msg.sender, to, amount, TransactionType.TRANSFER);
    }

    function saveToGoal(uint256 goalId, uint256 amount) public onlyRegistered {
        require(amount > 0, "Amount must be greater than 0");
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        users[msg.sender].balance -= amount;
        goalBalances[msg.sender][goalId] += amount;
        totalSaved[msg.sender] += amount;

        uint256 transactionId = _createTransaction(msg.sender, address(0), amount, TransactionType.SAVE);

        emit SavedToGoal(msg.sender, goalId, amount);
        emit TransactionCreated(transactionId, msg.sender, address(0), amount, TransactionType.SAVE);
    }

    function releaseFromGoal(uint256 goalId, uint256 amount) public onlyRegistered {
        require(amount > 0, "Amount must be greater than 0");
        require(goalBalances[msg.sender][goalId] >= amount, "Insufficient goal balance");
        goalBalances[msg.sender][goalId] -= amount;
        totalSaved[msg.sender] -= amount;
        users[msg.sender].balance += amount;

        uint256 transactionId = _createTransaction(msg.sender, address(0), amount, TransactionType.RELEASE);

        emit ReleasedFromGoal(msg.sender, goalId, amount);
        emit TransactionCreated(transactionId, msg.sender, address(0), amount, TransactionType.RELEASE);
    }

    function getGoalBalance(uint256 goalId) public view onlyRegistered returns (uint256) {
        return goalBalances[msg.sender][goalId];
    }

    function getMySavings() public view onlyRegistered returns (uint256) {
        return totalSaved[msg.sender];
    }

    function getMyBalance() public view onlyRegistered returns (uint256) {
        return users[msg.sender].balance;
    }

    function getUserZkpHash(address user) public view returns (bytes32) {
        require(users[user].registered, "User not registered");
        return users[user].zkpHash;
    }

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

    function getUserTransactions(address user) public view returns (uint256[] memory) {
        require(users[user].registered, "User not registered");
        return userTransactionIds[user];
    }

    function getUserTransactionCount(address user) public view returns (uint256) {
        require(users[user].registered, "User not registered");
        return userTransactionIds[user].length;
    }

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

    receive() external payable {
        revert("Please use the deposit function");
    }
}
