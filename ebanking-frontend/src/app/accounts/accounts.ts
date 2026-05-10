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

  filterType   = 'ALL';
  filterStatus = 'ALL';
  searchId     = '';

  // Operation modal
  operationType     = 'DEBIT';
  operationAmount   = 0;
  operationDesc     = '';
  operationAccountId = '';
  showOperationModal = false;

  // Transfer modal
  transferSource = '';
  transferDest   = '';
  transferAmount = 0;
  showTransferModal = false;

  loading        = false;
  historyLoading = false;
  successMsg     = '';
  errorMsg       = '';

  constructor(private accountService: AccountService) {}

  ngOnInit(): void { this.loadAccounts(); }

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
    let r = [...this.accounts];
    if (this.filterType   !== 'ALL') r = r.filter(a => a.type   === this.filterType);
    if (this.filterStatus !== 'ALL') r = r.filter(a => a.status === this.filterStatus);
    if (this.searchId.trim())        r = r.filter(a => a.id.toLowerCase().includes(this.searchId.trim().toLowerCase()));
    this.filtered = r;
  }

  selectAccount(acc: BankAccountDTO): void {
    this.selectedAccount = acc;
    this.historyLoading  = true;
    this.history         = null;
    this.accountService.getAccountHistory(acc.id).subscribe({
      next:  (h) => { this.history = h; this.historyLoading = false; },
      error: ()  => { this.historyLoading = false; }
    });
  }

  loadPage(page: number): void {
    if (!this.selectedAccount) return;
    this.accountService.getAccountHistory(this.selectedAccount.id, page).subscribe({
      next: (h) => { this.history = h; }
    });
  }

  // ── Operation modal ──────────────────────────────────────────
  openOperation(type: string): void {
    this.operationType      = type;
    this.operationAmount    = 0;
    this.operationDesc      = '';
    this.operationAccountId = this.selectedAccount?.id || '';
    this.errorMsg           = '';
    this.showOperationModal = true;
  }

  closeOperation(): void { this.showOperationModal = false; }

  submitOperation(): void {
    if (!this.operationAccountId || this.operationAmount <= 0) {
      this.errorMsg = 'Fill in all fields with a positive amount.'; return;
    }
    const obs = this.operationType === 'DEBIT'
      ? this.accountService.debit ({ accountId: this.operationAccountId, amount: this.operationAmount, description: this.operationDesc })
      : this.accountService.credit({ accountId: this.operationAccountId, amount: this.operationAmount, description: this.operationDesc });

    obs.subscribe({
      next: () => {
        this.successMsg        = `${this.operationType} of ${this.operationAmount} MAD applied successfully.`;
        this.showOperationModal = false;
        this.loadAccounts();
        if (this.selectedAccount) this.selectAccount(this.selectedAccount);
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Operation failed. Check balance or account ID.';
      }
    });
  }

  // ── Transfer modal ───────────────────────────────────────────
  openTransfer(): void {
    this.transferSource   = this.selectedAccount?.id || '';
    this.transferDest     = '';
    this.transferAmount   = 0;
    this.errorMsg         = '';
    this.showTransferModal = true;
  }

  closeTransfer(): void { this.showTransferModal = false; }

  submitTransfer(): void {
    if (!this.transferSource || !this.transferDest || this.transferAmount <= 0) {
      this.errorMsg = 'Select both accounts and enter a positive amount.'; return;
    }
    if (this.transferSource === this.transferDest) {
      this.errorMsg = 'Source and destination accounts must be different.'; return;
    }
    this.accountService.transfer({
      accountSource:      this.transferSource,
      accountDestination: this.transferDest,
      amount:             this.transferAmount,
      description:        'Transfer'
    }).subscribe({
      next: () => {
        this.successMsg       = `Transfer of ${this.transferAmount} MAD completed successfully.`;
        this.showTransferModal = false;
        this.loadAccounts();
        if (this.selectedAccount) this.selectAccount(this.selectedAccount);
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Transfer failed. Insufficient balance or invalid accounts.';
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────
  getTypeLabel(type: string): string { return type === 'CurrentAccount' ? 'Current' : 'Savings'; }
  getTypeClass(type: string): string { return type === 'CurrentAccount' ? 'current' : 'saving'; }
  getStatusClass(s: string): string  { return ({ACTIVATED:'active',SUSPENDED:'suspended',CREATED:'created'} as any)[s] ?? ''; }
  getPageArray(): number[]            { return this.history ? Array.from({length: this.history.totalPages}, (_, i) => i) : []; }

  // Accounts available as transfer destination (all except source)
  getDestAccounts(): BankAccountDTO[] {
    return this.accounts.filter(a => a.id !== this.transferSource && a.status === 'ACTIVATED');
  }

  // Label for account dropdown
  accountLabel(a: BankAccountDTO): string {
    return `${a.customerDTO?.name ?? '—'} · ${a.id.slice(0,10)}… · ${a.balance.toLocaleString('fr-MA')} MAD`;
  }
}