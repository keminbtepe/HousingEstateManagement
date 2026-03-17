export interface Block {
  id: number;
  name: string;
}

export interface DashboardData {
  poolBalance: number;
  totalResidents: number;
  totalStaff: number;
  totalBlocks: number;
  recentTransactions: Transaction[];
  activeElections: ActiveElection[];
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  transactionType: number;
}

export interface ActiveElection {
  id: number;
  title: string;
  endDate: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  scope: number;
  date: string;
  createdBy: string;
  blockName?: string;
}

export interface Candidate {
  candidateId: number;
  fullName: string;
  voteCount: number;
}

export interface Election {
  id: number;
  title: string;
  description?: string;
  type: number;
  scope: number;
  blockId?: number;
  blockName?: string;
  displayEndDate: string;
  totalVotes: number;
  isCompleted: boolean;
  candidates: Candidate[];
  userVotedCandidateId?: number;
  createdByRole: number;
}

export interface Ledger {
  poolName: string;
  poolType: number;
  blockId?: number;
  balance: number;
  transactions: Transaction[];
}

export interface RecurringTransaction {
  id: number;
  description: string;
  amount: number;
  transactionType: number;
  dayOfMonth: number;
  isActive: boolean;
}

export interface Resident {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: number;
  roleName?: string;
  blockId?: number;
  blockName?: string;
  apartmentNumber?: number;
}

export interface BlockSummary {
  blockId: number;
  blockName: string;
  managerName?: string;
  totalApartments: number;
  activeResidents: number;
  balance: number;
}
