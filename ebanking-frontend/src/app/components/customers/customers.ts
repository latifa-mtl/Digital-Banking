import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../services/customer';
import { Customer } from '../../models/customer.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = false;
  error = '';
  successMsg = '';
  showModal = false;
  editMode = false;
  customerForm: FormGroup;
  selectedCustomer: Customer | null = null;
  searchKeyword = '';
  searchInput = new Subject<string>();
  deleteConfirmId: number | null = null;

  isAdmin = false;


  constructor(private customerService: CustomerService, private fb: FormBuilder,  private authService: AuthService) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]

    });

  }
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = this.authService.isAdmin();
    });
    this.loadCustomers();
    this.searchInput.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(keyword => this.filterCustomers(keyword));
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des clients.';
        this.loading = false;
      }
    });
  }

  filterCustomers(keyword: string): void {
    this.filteredCustomers = keyword
      ? this.customers.filter(c =>
        c.name.toLowerCase().includes(keyword.toLowerCase()) ||
        c.email.toLowerCase().includes(keyword.toLowerCase())
      )
      : this.customers;
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.next(value);
  }

  openCreateModal(): void {
    this.editMode = false;
    this.selectedCustomer = null;
    this.customerForm.reset();
    this.showModal = true;
  }

  openEditModal(customer: Customer): void {
    this.editMode = true;
    this.selectedCustomer = customer;
    this.customerForm.patchValue({ name: customer.name, email: customer.email });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.customerForm.reset();
    this.error = '';
  }

  saveCustomer(): void {
    if (this.customerForm.invalid) return;
    this.loading = true;

    const customer = this.customerForm.value as Customer;
    const obs = this.editMode && this.selectedCustomer
      ? this.customerService.updateCustomer(this.selectedCustomer.id, customer)
      : this.customerService.saveCustomer(customer);

    obs.subscribe({
      next: () => {
        this.successMsg = this.editMode ? 'Client modifié avec succès.' : 'Client ajouté avec succès.';
        this.closeModal();
        this.loadCustomers();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.error = 'Erreur lors de la sauvegarde.';
        this.loading = false;
      }
    });
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteCustomer(id: number): void {
    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        this.successMsg = 'Client supprimé avec succès.';
        this.customers = this.customers.filter(c => c.id !== id);
        this.filteredCustomers = this.filteredCustomers.filter(c => c.id !== id);
        this.deleteConfirmId = null;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.error = 'Erreur lors de la suppression.';
        this.deleteConfirmId = null;
      }
    });
  }
}
