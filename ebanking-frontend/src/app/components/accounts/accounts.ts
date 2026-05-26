import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../services/account';
import { CustomerService } from '../../services/customer';
import { BankAccount, CurrentAccount, SavingAccount } from '../../models/account.model';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts implements OnInit {
  accounts: BankAccount[] = [];
  customers: Customer[] = [];
  loading = false;
  error = '';
  successMsg = '';
  showModal = false;
  accountForm: FormGroup;
  accountType: 'current' | 'saving' = 'current';
  filterCustomerId: number | null = null;

  constructor(
    private accountService: AccountService,
    private customerService: CustomerService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.accountForm = this.fb.group({
      customerId: ['', Validators.required],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      currency: ['MAD', Validators.required],
      overDraft: [1000],
      interestRate: [3.5]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filterCustomerId = params['customerId'] ? +params['customerId'] : null;
      this.loadAccounts();
    });
    this.loadCustomers();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = this.filterCustomerId
          ? data.filter(a => a.customerDTO?.id === this.filterCustomerId)
          : data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des comptes.';
        this.loading = false;
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (data) => this.customers = data
    });
  }

  openModal(type: 'current' | 'saving'): void {
    this.accountType = type;
    this.accountForm.reset({
      customerId: '', initialBalance: 0, currency: 'MAD',
      overDraft: 1000, interestRate: 3.5
    });
    if (this.filterCustomerId) {
      this.accountForm.patchValue({ customerId: this.filterCustomerId });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.error = '';
  }

  saveAccount(): void {
    if (this.accountForm.invalid) return;
    const { customerId, initialBalance, currency, overDraft, interestRate } = this.accountForm.value;
    this.loading = true;

    const obs = this.accountType === 'current'
      ? this.accountService.saveCurrentAccount(customerId, initialBalance, overDraft, currency)
      : this.accountService.saveSavingAccount(customerId, initialBalance, interestRate, currency);

    obs.subscribe({
      next: () => {
        this.successMsg = 'Compte créé avec succès.';
        this.closeModal();
        this.loadAccounts();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.error = 'Erreur lors de la création du compte.';
        this.loading = false;
      }
    });
  }

  asCurrentAccount(account: BankAccount): CurrentAccount {
    return account as CurrentAccount;
  }

  asSavingAccount(account: BankAccount): SavingAccount {
    return account as SavingAccount;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVATED: 'badge-activated',
      CREATED: 'badge-created',
      SUSPENDED: 'badge-suspended'
    };
    return map[status] ?? 'badge-created';
  }

  getCustomerName(id: number): string {
    return this.customers.find(c => c.id === id)?.name ?? '—';
  }
}
