# Blockchain

`contracts/DigitalWallet.sol` is the on-chain ledger: registration, deposits, withdrawals, transfers,
and savings goals (money locked per goal with `saveToGoal` / `releaseFromGoal`).

```shell
npm install
npm test          # contract tests (in-memory Hardhat chain)
```

## Redeploying the contract

Contracts can't be changed in place, so a new version means a new deployment with empty state.
The steps below deploy it, point the backend at it, and carry every user's balance and savings over.
Do this on **each machine** that runs its own Ganache + database.

1. **Ganache running** on `127.0.0.1:7545` (the `ganache` network in `hardhat.config.ts`).
2. **Deploy:**
   ```shell
   cd blockchain
   npm install
   npm run deploy
   ```
   This deploys `DigitalWallet`, writes its ABI to `backend/app/utils/digital_wallet.json`, sets
   `CONTRACT_ADDRESS` in `backend/.env`, and prints the migration command with the old address.
3. **Stop the backend**, then migrate users (use the exact command `npm run deploy` printed):
   ```shell
   cd backend
   venv/Scripts/python -m scripts.migrate_contract <OLD_CONTRACT_ADDRESS>   # macOS/Linux: venv/bin/python
   ```
   For each user it registers their wallet on the new contract, re-credits their spendable balance and
   re-locks their savings-goal money. It is safe to re-run; users already on the new contract are skipped.
4. **Start the backend** again.

If Ganache was reset (old contract gone), the migration still re-registers every user on the new
contract, with zero balances. This also fixes "wallet isn't registered" errors after a Ganache reset.

## Integration check (optional)

Runs the backend's savings + migration code against a throwaway chain, not your Ganache:

```shell
cd blockchain && npx hardhat node --port 8545          # terminal 1
cd backend && venv/Scripts/python -m tests.test_savings_chain   # terminal 2
```
