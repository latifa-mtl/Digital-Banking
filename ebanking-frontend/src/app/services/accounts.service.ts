import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountHistoryDTO, BankAccountDTO, CreditDTO, DebitDTO, TransferDTO } from '../model/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<BankAccountDTO[]> {
    return this.http.get<BankAccountDTO[]>(`${this.baseUrl}/accounts`);
  }

  getAccount(accountId: string): Observable<BankAccountDTO> {
    return this.http.get<BankAccountDTO>(`${this.baseUrl}/accounts/${accountId}`);
  }

  getAccountHistory(accountId: string, page: number = 0, size: number = 5): Observable<AccountHistoryDTO> {
    return this.http.get<AccountHistoryDTO>(
      `${this.baseUrl}/accounts/${accountId}/pageOperations?page=${page}&size=${size}`
    );
  }

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
