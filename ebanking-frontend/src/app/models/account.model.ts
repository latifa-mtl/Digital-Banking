import { Customer } from './customer.model';

export type AccountStatus = 'CREATED' | 'ACTIVATED' | 'SUSPENDED';
export type OperationType = 'DEBIT' | 'CREDIT';
export type AccountType = 'CurrentAccount' | 'SavingAccount';

export interface BankAccount {
  type: AccountType;
  id: string;
  balance: number;
  createdAt: Date;
  status: AccountStatus;
  currency: string;
  customerDTO: Customer;
  createdBy?: string;
}

export interface CurrentAccount extends BankAccount {
  type: 'CurrentAccount';
  overDraft: number;
}

export interface SavingAccount extends BankAccount {
  type: 'SavingAccount';
  interestRate: number;
}

export interface AccountOperation {
  id: number;
  operationDate: Date;
  amount: number;
  type: OperationType;
  description: string;
  performedBy?: string;
}

export interface AccountHistory {
  accountId: string;
  balance: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  accountOperationDTOS: AccountOperation[];
}

export interface DebitRequest {
  accountId: string;
  amount: number;
  description: string;
}

export interface CreditRequest {
  accountId: string;
  amount: number;
  description: string;
}

export interface TransferRequest {
  accountSource: string;
  accountDestination: string;
  amount: number;
  description: string;
}
