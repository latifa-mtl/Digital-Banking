export interface RecentAccountDTO {
  id: string;
  type: string;
  balance: number;
  status: string;
  currency: string;
  customerName: string;
  createdAt: string;
  overdraft?: number;
  interestRate?: number;
}

export interface RecentOperationDTO {
  id: number;
  operationDate: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  accountId: string;
  customerName: string;
}

export interface CustomerSummary {
  id: number;
  name: string;
  email: string;
}

export interface DashboardDTO {
  totalCustomers: number;
  totalAccounts: number;
  activeAccounts: number;
  suspendedAccounts: number;
  currentAccounts: number;
  savingAccounts: number;
  totalBalance: number;
  totalDebitAmount: number;
  totalCreditAmount: number;
  totalOperations: number;
  recentCustomers: CustomerSummary[];
  recentAccounts: RecentAccountDTO[];
  recentOperations: RecentOperationDTO[];
}