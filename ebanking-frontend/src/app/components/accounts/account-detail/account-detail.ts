import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../../services/account';
import { BankAccount, AccountHistory, CurrentAccount, SavingAccount } from '../../../models/account.model';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './account-detail.html',
  styleUrls: ['./account-detail.css']
})
export class AccountDetail implements OnInit {
  account: BankAccount | null = null;
  history: AccountHistory | null = null;
  loading = false;
  operationLoading = false;
  error = '';
  successMsg = '';
  activeOperation: 'debit' | 'credit' | 'transfer' | null = null;

  currentPage = 0;
  pageSize = 5;
  accountId = '';

  operationForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private fb: FormBuilder
  ) {
    this.operationForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      destinationAccount: ['']
    });
  }

  ngOnInit(): void {
    this.accountId = this.route.snapshot.params['id'];
    this.loadAccount();
    this.loadHistory();
  }

  loadAccount(): void {
    this.accountService.getAccount(this.accountId).subscribe({
      next: (data) => this.account = data,
      error: () => this.error = 'Compte introuvable.'
    });
  }

  loadHistory(page = 0): void {
    this.loading = true;
    this.currentPage = page;
    this.accountService.getAccountHistory(this.accountId, page, this.pageSize).subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des opérations.';
        this.loading = false;
      }
    });
  }

  openOperation(type: 'debit' | 'credit' | 'transfer'): void {
    this.activeOperation = type;
    this.operationForm.reset({ amount: 0, description: '', destinationAccount: '' });
    if (type === 'transfer') {
      this.operationForm.get('destinationAccount')?.setValidators(Validators.required);
    } else {
      this.operationForm.get('destinationAccount')?.clearValidators();
    }
    this.operationForm.get('destinationAccount')?.updateValueAndValidity();
    this.error = '';
  }

  closeOperation(): void {
    this.activeOperation = null;
    this.error = '';
  }

  executeOperation(): void {
    if (this.operationForm.invalid) return;
    this.operationLoading = true;
    const { amount, description, destinationAccount } = this.operationForm.value;

    let obs;
    if (this.activeOperation === 'debit') {
      obs = this.accountService.debit({ accountId: this.accountId, amount, description });
    } else if (this.activeOperation === 'credit') {
      obs = this.accountService.credit({ accountId: this.accountId, amount, description });
    } else {
      obs = this.accountService.transfer({
        accountSource: this.accountId,
        accountDestination: destinationAccount,
        amount, description
      });
    }

    obs.subscribe({
      next: () => {
        this.successMsg = 'Opération effectuée avec succès.';
        this.closeOperation();
        this.loadAccount();
        this.loadHistory(0);
        this.operationLoading = false;
        setTimeout(() => this.successMsg = '', 3500);
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Erreur lors de l\'opération.';
        this.operationLoading = false;
      }
    });
  }

  getPages(): number[] {
    if (!this.history) return [];
    return Array.from({ length: this.history.totalPages }, (_, i) => i);
  }

  asCurrentAccount(a: BankAccount): CurrentAccount { return a as CurrentAccount; }
  asSavingAccount(a: BankAccount): SavingAccount   { return a as SavingAccount; }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVATED: 'badge-activated', CREATED: 'badge-created', SUSPENDED: 'badge-suspended'
    };
    return map[status] ?? 'badge-created';
  }
}
