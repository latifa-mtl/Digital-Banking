export interface AccountOperation {
  id: number;
  operationDate: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
}

export interface AccountHistoryDTO {
  accountId: string;
  balance: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  accountOperationDTOS: AccountOperation[];
}

export interface BankAccountDTO {
  type: string;
  id: string;
  balance: number;
  createdAt: string;
  status: 'ACTIVATED' | 'SUSPENDED' | 'CREATED';
  customerDTO: { id: number; name: string; email: string };
  overDraft?: number;
  interestRate?: number;
}

export interface DebitDTO {
  accountId: string;
  amount: number;
  description: string;
}

export interface CreditDTO {
  accountId: string;
  amount: number;
  description: string;
}

export interface TransferDTO {
  accountSource: string;
  accountDestination: string;
  amount: number;
  description: string;
}
