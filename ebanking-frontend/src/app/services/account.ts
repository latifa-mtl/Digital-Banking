import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BankAccount, AccountHistory,
  DebitRequest, CreditRequest, TransferRequest
} from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = `${environment.backendHost}`;

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/accounts`);
  }

  getAccount(accountId: string): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.apiUrl}/accounts/${accountId}`);
  }

  getAccountsByCustomerId(customerId: number): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/accounts/customer/${customerId}`);
  }

  getAccountHistory(accountId: string, page: number, size: number): Observable<AccountHistory> {
    return this.http.get<AccountHistory>(
      `${this.apiUrl}/accounts/${accountId}/pageOperations?page=${page}&size=${size}`
    );
  }

  debit(request: DebitRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/accounts/debit`, request);
  }

  credit(request: CreditRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/accounts/credit`, request);
  }

  transfer(request: TransferRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/accounts/transfer`, request);
  }

  saveCurrentAccount(customerId: number, initialBalance: number, overDraft: number, currency: string): Observable<BankAccount> {
    return this.http.post<BankAccount>(
      `${this.apiUrl}/accounts/current`, null,
      { params: { customerId, initialBalance, overDraft, currency } }
    );
  }

  saveSavingAccount(customerId: number, initialBalance: number, interestRate: number, currency: string): Observable<BankAccount> {
    return this.http.post<BankAccount>(
      `${this.apiUrl}/accounts/saving`, null,
      { params: { customerId, initialBalance, interestRate, currency } }
    );
  }
}
