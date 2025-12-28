// Contract types based on the Karma smart contract interface
export type Outcome = 'YES' | 'NO';

export const Outcome = {
  YES: 'YES' as Outcome,
  NO: 'NO' as Outcome,
};

export type Bet = {
  side: Outcome;
  quantity: number;
};

export type Market = {
  creator: string;
  id: string;
  question: string;
  num_yes: number;
  num_no: number;
  liquidity: number; // LMSR b
  resolved: boolean;
  outcome: Outcome | null;
  voters: Record<string, Bet>;
};

export type User = {
  id: string;
  bio: string;
  balance: number;
  history: string[]; // ids of all the markets this user has voted in
};

// Contract interface methods
export type KarmaContract = {
  register_user: (bio: string) => Promise<void>;
  add_market: (question: string, liquidity: number) => Promise<void>;
  get_users: () => Promise<User[]>;
  get_markets: () => Promise<Market[]>;
  get_user: (id: string) => Promise<User | null>;
  get_market: (id: string) => Promise<Market | null>;
  bet: (market_id: string, side: Outcome) => Promise<{ Ok: null } | { Err: string }>;
  resolve: (market_id: string) => Promise<{ Ok: null } | { Err: string }>;
  deposit: (amount: number) => Promise<void>;
};

