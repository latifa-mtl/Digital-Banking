import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../services/accounts.service';
import { BankAccountDTO, AccountHistoryDTO } from '../model/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.html',
  styleUrls: ['./accounts.css']
})
export class AccountsComponent implements OnInit {
  accounts: BankAccountDTO[] = [];
  filtered: BankAccountDTO[] = [];
  selectedAccount: BankAccountDTO | null = null;
  history: AccountHistoryDTO | null = null;

  filterType = 'ALL';
  filterStatus = 'ALL';
  searchId = '';

  operationType = 'DEBIT';
  operationAmount = 0;
  operationDesc = '';
  operationAccountId = '';

  transferSource = '';
  transferDest = '';
  transferAmount = 0;

  showOperationModal = false;
  showTransferModal = false;
  loading = false;
  historyLoading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load accounts.'; }
    });
  }

  applyFilters(): void {
    let result = [...this.accounts];
    if (this.filterType !== 'ALL') result = result.filter(a => a.type === this.filterType);
    if (this.filterStatus !== 'ALL') result = result.filter(a => a.status === this.filterStatus);
    if (this.searchId.trim()) result = result.filter(a => a.id.includes(this.searchId.trim()));
    this.filtered = result;
  }

  selectAccount(acc: BankAccountDTO): void {
    this.selectedAccount = acc;
    this.historyLoading = true;
    this.history = null;
    this.accountService.getAccountHistory(acc.id).subscribe({
      next: (h) => { this.history = h; this.historyLoading = false; },
      error: () => { this.historyLoading = false; }
    });
  }

  loadPage(page: number): void {
    if (!this.selectedAccount) return;
    this.accountService.getAccountHistory(this.selectedAccount.id, page).subscribe({
      next: (h) => { this.history = h; },
      error: () => {}
    });
  }

  openOperation(type: string): void {
    this.operationType = type;
    this.operationAmount = 0;
    this.operationDesc = '';
    this.operationAccountId = this.selectedAccount?.id || '';
    this.showOperationModal = true;
  }

  submitOperation(): void {
    if (!this.operationAccountId || this.operationAmount <= 0) return;
    const obs = this.operationType === 'DEBIT'
      ? this.accountService.debit({ accountId: this.operationAccountId, amount: this.operationAmount, description: this.operationDesc })
      : this.accountService.credit({ accountId: this.operationAccountId, amount: this.operationAmount, description: this.operationDesc });

    obs.subscribe({
      next: () => {
        this.successMsg = `${this.operationType} operation successful.`;
        this.showOperationModal = false;
        this.loadAccounts();
        if (this.selectedAccount) this.selectAccount(this.selectedAccount);
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.errorMsg = 'Operation failed.'; }
    });
  }

  submitTransfer(): void {
    if (!this.transferSource || !this.transferDest || this.transferAmount <= 0) return;
    this.accountService.transfer({
      accountSource: this.transferSource,
      accountDestination: this.transferDest,
      amount: this.transferAmount,
      description: 'Transfer'
    }).subscribe({
      next: () => {
        this.successMsg = 'Transfer successful.';
        this.showTransferModal = false;
        this.loadAccounts();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.errorMsg = 'Transfer failed. Check balance.'; }
    });
  }

  getTypeLabel(type: string): string {
    return type === 'CurrentAccount' ? 'Current' : 'Savings';
  }

  getStatusClass(status: string): string {
    const m: any = { ACTIVATED: 'active', SUSPENDED: 'suspended', CREATED: 'created' };
    return m[status] || '';
  }

  getPageArray(): number[] {
    if (!this.history) return [];
    return Array.from({ length: this.history.totalPages }, (_, i) => i);
  }
}
