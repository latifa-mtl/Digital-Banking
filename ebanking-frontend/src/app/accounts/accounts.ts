import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../services/accounts.service';
import { CustomerService } from '../services/customer.service';
import { BankAccountDTO, AccountHistoryDTO } from '../model/account.model';
import { Customer } from '../model/customer.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.html',
  styleUrls: ['./accounts.css']
})
export class AccountsComponent implements OnInit {

  // ── Data ─────────────────────────────────────────────────────
  accounts: BankAccountDTO[] = [];
  filtered: BankAccountDTO[]  = [];
  customers: Customer[]        = [];
  selectedAccount: BankAccountDTO | null = null;
  history: AccountHistoryDTO  | null = null;

  // ── Filters ───────────────────────────────────────────────────
  filterType   = 'ALL';
  filterStatus = 'ALL';
  searchId     = '';

  // ── Operation modal ───────────────────────────────────────────
  operationType      = 'DEBIT';
  operationAmount    = 0;
  operationDesc      = '';
  operationAccountId = '';
  showOperationModal = false;

  // ── Transfer modal ────────────────────────────────────────────
  transferSource    = '';
  transferDest      = '';
  transferAmount    = 0;
  showTransferModal = false;

  // ── New Account modal ─────────────────────────────────────────
  showNewAccountModal = false;
  newAccountType      = 'CURRENT';   // 'CURRENT' | 'SAVING'
  newAccountCustomerId: number | null = null;
  newAccountBalance   = 0;
  newAccountOverdraft = 0;           // CurrentAccount only
  newAccountRate      = 0;           // SavingAccount only
  customerSearch      = '';
  filteredCustomers: Customer[] = [];

  // ── State ─────────────────────────────────────────────────────
  loading        = false;
  historyLoading = false;
  successMsg     = '';
  errorMsg       = '';
  modalError     = '';

  constructor(
    private accountService: AccountService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadCustomers();
  }

  // ── Loaders ───────────────────────────────────────────────────
  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        // Normalise: ensure customerDTO is never undefined
        this.accounts = data.map(a => ({
          ...a,
          customerDTO: a.customerDTO ?? null
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load accounts.'; }
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (c) => { this.customers = c; this.filteredCustomers = c; },
      error: () => {}
    });
  }

  // ── Filters ───────────────────────────────────────────────────
  applyFilters(): void {
    let r = [...this.accounts];
    if (this.filterType   !== 'ALL') r = r.filter(a => a.type   === this.filterType);
    if (this.filterStatus !== 'ALL') r = r.filter(a => a.status === this.filterStatus);
    if (this.searchId.trim()) {
      const kw = this.searchId.trim().toLowerCase();
      r = r.filter(a =>
        a.id.toLowerCase().includes(kw) ||
        (a.customerDTO?.name ?? '').toLowerCase().includes(kw)
      );
    }
    this.filtered = r;
  }

  // ── Account selection & history ───────────────────────────────
  selectAccount(acc: BankAccountDTO): void {
    this.selectedAccount = acc;
    this.historyLoading  = true;
    this.history         = null;
    this.accountService.getAccountHistory(acc.id).subscribe({
      next:  h  => { this.history = h; this.historyLoading = false; },
      error: () => { this.historyLoading = false; }
    });
  }

  loadPage(page: number): void {
    if (!this.selectedAccount) return;
    this.accountService.getAccountHistory(this.selectedAccount.id, page)
      .subscribe({ next: h => { this.history = h; } });
  }

  // ── Operation modal ───────────────────────────────────────────
  openOperation(type: string): void {
    this.operationType      = type;
    this.operationAmount    = 0;
    this.operationDesc      = '';
    this.operationAccountId = this.selectedAccount?.id ?? '';
    this.modalError         = '';
    this.showOperationModal = true;
  }

  closeOperation(): void { this.showOperationModal = false; this.modalError = ''; }

  submitOperation(): void {
    if (!this.operationAccountId || this.operationAmount <= 0) {
      this.modalError = 'Enter a positive amount.'; return;
    }
    const obs = this.operationType === 'DEBIT'
      ? this.accountService.debit ({ accountId: this.operationAccountId, amount: this.operationAmount, description: this.operationDesc })
      : this.accountService.credit({ accountId: this.operationAccountId, amount: this.operationAmount, description: this.operationDesc });

    obs.subscribe({
      next: () => {
        this.successMsg        = `${this.operationType} of ${this.operationAmount.toLocaleString()} MAD applied.`;
        this.showOperationModal = false;
        this.loadAccounts();
        if (this.selectedAccount) {
          // refresh detail
          const id = this.selectedAccount.id;
          setTimeout(() => {
            const found = this.accounts.find(a => a.id === id);
            if (found) this.selectAccount(found);
          }, 600);
        }
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: err => { this.modalError = err?.error?.message ?? 'Operation failed. Check balance.'; }
    });
  }

  // ── Transfer modal ────────────────────────────────────────────
  openTransfer(): void {
    this.transferSource    = this.selectedAccount?.id ?? '';
    this.transferDest      = '';
    this.transferAmount    = 0;
    this.modalError        = '';
    this.showTransferModal = true;
  }

  closeTransfer(): void { this.showTransferModal = false; this.modalError = ''; }

  submitTransfer(): void {
    if (!this.transferSource || !this.transferDest || this.transferAmount <= 0) {
      this.modalError = 'Select both accounts and enter a positive amount.'; return;
    }
    if (this.transferSource === this.transferDest) {
      this.modalError = 'Source and destination must be different.'; return;
    }
    this.accountService.transfer({
      accountSource: this.transferSource, accountDestination: this.transferDest,
      amount: this.transferAmount, description: 'Transfer'
    }).subscribe({
      next: () => {
        this.successMsg        = `Transfer of ${this.transferAmount.toLocaleString()} MAD completed.`;
        this.showTransferModal  = false;
        this.loadAccounts();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: err => { this.modalError = err?.error?.message ?? 'Transfer failed. Insufficient balance?'; }
    });
  }

  // ── New Account modal ─────────────────────────────────────────
  openNewAccount(): void {
    this.newAccountType       = 'CURRENT';
    this.newAccountCustomerId = null;
    this.newAccountBalance    = 0;
    this.newAccountOverdraft  = 0;
    this.newAccountRate       = 0;
    this.customerSearch       = '';
    this.filteredCustomers    = this.customers;
    this.modalError           = '';
    this.showNewAccountModal  = true;
  }

  closeNewAccount(): void { this.showNewAccountModal = false; this.modalError = ''; }

  filterCustomers(): void {
    const kw = this.customerSearch.toLowerCase();
    this.filteredCustomers = kw
      ? this.customers.filter(c => c.name.toLowerCase().includes(kw) || c.email.toLowerCase().includes(kw))
      : this.customers;
  }

  selectCustomerForAccount(c: Customer): void {
    this.newAccountCustomerId = c.id!;
    this.customerSearch       = `${c.name} — ${c.email}`;
    this.filteredCustomers    = [];   // close dropdown
  }

  submitNewAccount(): void {
    if (!this.newAccountCustomerId || this.newAccountBalance < 0) {
      this.modalError = 'Select a customer and enter a valid initial balance.'; return;
    }
    const obs = this.newAccountType === 'CURRENT'
      ? this.accountService.saveCurrentAccount(
          this.newAccountBalance,
          this.newAccountOverdraft,
          this.newAccountCustomerId
        )
      : this.accountService.saveSavingAccount(
          this.newAccountBalance,
          this.newAccountRate,
          this.newAccountCustomerId
        );

    obs.subscribe({
      next: (created) => {
        this.successMsg          = `Account created successfully (ID: ${created.id?.slice(0,12)}…).`;
        this.showNewAccountModal  = false;
        this.loadAccounts();
        setTimeout(() => this.successMsg = '', 5000);
      },
      error: err => { this.modalError = err?.error?.message ?? 'Failed to create account.'; }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  getTypeLabel(type: string): string { return type === 'CurrentAccount' ? 'Current' : 'Savings'; }
  getTypeClass(type: string): string { return type === 'CurrentAccount' ? 'current' : 'saving'; }
  getStatusClass(s: string): string  {
    return ({ ACTIVATED: 'active', SUSPENDED: 'suspended', CREATED: 'created' } as any)[s] ?? '';
  }
  getPageArray(): number[] {
    return this.history ? Array.from({ length: this.history.totalPages }, (_, i) => i) : [];
  }
  ownerLabel(a: BankAccountDTO): string {
    if (!a.customerDTO) return a.id.slice(0, 14) + '…';
    return `${a.customerDTO.name}  ·  ${a.id.slice(0, 12)}…  ·  ${a.balance.toLocaleString('fr-MA')} MAD`;
  }
  destAccounts(): BankAccountDTO[] {
    return this.accounts.filter(a => a.id !== this.transferSource && a.status === 'ACTIVATED');
  }
  getAccountById(id: string): BankAccountDTO | undefined {
    return this.accounts.find(a => a.id === id);
  }
}