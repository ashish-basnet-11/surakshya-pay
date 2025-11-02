export interface TransferInterface {
  to_username: string,
  category?: string,
  amount: number,
}

export interface WithDrawInterface {
    amount: number,
}

export interface TopupInterface {
    amount: number,
}

export interface TransactionInterface {
  id: number;
  amount: number;
  category: 'deposit' | 'withdraw' | 'transfer' | string;
  description: string;
  transaction_type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | string;
  user_id: number;
  timestamp: string; // ISO date string
  blockchain_id: string | null;
  from_address: string;
  to_address: string;
  blockchain_timestamp: number;
  is_completed: boolean;
  blockchain_hash: string;
}
