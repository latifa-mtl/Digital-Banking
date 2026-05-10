import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AccountHistoryDTO, BankAccountDTO,
  CreditDTO, DebitDTO, TransferDTO
} from '../model/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // ── Read ────────────────────────────────────────────────────────
  getAccounts(): Observable<BankAccountDTO[]> {
    return this.http.get<BankAccountDTO[]>(`${this.baseUrl}/accounts`);
  }

  getAccount(accountId: string): Observable<BankAccountDTO> {
    return this.http.get<BankAccountDTO>(`${this.baseUrl}/accounts/${accountId}`);
  }

  getAccountHistory(accountId: string, page = 0, size = 5): Observable<AccountHistoryDTO> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<AccountHistoryDTO>(
      `${this.baseUrl}/accounts/${accountId}/pageOperations`, { params }
    );
  }

  // ── Create accounts — backend uses @RequestParam so pass as query params ──
  saveCurrentAccount(
    initialBalance: number,
    overDraft: number,
    customerId: number
  ): Observable<BankAccountDTO> {
    const params = new HttpParams()
      .set('initialBalance', initialBalance.toString())
      .set('overDraft',      overDraft.toString())
      .set('customerId',     customerId.toString());
    return this.http.post<BankAccountDTO>(
      `${this.baseUrl}/accounts/saveCurrent`, null, { params }
    );
  }

  saveSavingAccount(
    initialBalance: number,
    interestRate: number,
    customerId: number
  ): Observable<BankAccountDTO> {
    const params = new HttpParams()
      .set('initialBalance', initialBalance.toString())
      .set('interestRate',   interestRate.toString())
      .set('customerId',     customerId.toString());
    return this.http.post<BankAccountDTO>(
      `${this.baseUrl}/accounts/saveSaving`, null, { params }
    );
  }

  // ── Operations ──────────────────────────────────────────────────
  debit(dto: DebitDTO): Observable<DebitDTO> {
    return this.http.post<DebitDTO>(`${this.baseUrl}/accounts/debit`, dto);
  }

  credit(dto: CreditDTO): Observable<CreditDTO> {
    return this.http.post<CreditDTO>(`${this.baseUrl}/accounts/credit`, dto);
  }

  transfer(dto: TransferDTO): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/accounts/transfer`, dto);
  }
}