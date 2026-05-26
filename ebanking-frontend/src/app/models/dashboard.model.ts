export interface DashboardStats {
  totalCustomers: number;
  totalAccounts: number;
  totalOperations: number;
  totalBalance: number;
  totalCredits: number;
  totalDebits: number;
  totalCurrentAccounts: number;
  totalSavingAccounts: number;
  operationsPerMonth: { [key: string]: number };
  balancePerAccountType: { [key: string]: number };
}
