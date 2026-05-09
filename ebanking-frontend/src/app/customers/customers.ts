import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../model/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filtered: Customer[] = [];
  searchKeyword = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  editingCustomer: Customer | null = null;
  showEditModal = false;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.filtered = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load customers.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const kw = this.searchKeyword.trim().toLowerCase();
    if (!kw) {
      this.filtered = this.customers;
      return;
    }
    this.filtered = this.customers.filter(c =>
      c.name.toLowerCase().includes(kw) || c.email.toLowerCase().includes(kw)
    );
  }

  onServerSearch(): void {
    this.loading = true;
    this.customerService.searchCustomers(this.searchKeyword).subscribe({
      next: (data) => {
        this.filtered = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Search failed.';
        this.loading = false;
      }
    });
  }

  openEdit(customer: Customer): void {
    this.editingCustomer = { ...customer };
    this.showEditModal = true;
  }

  closeEdit(): void {
    this.showEditModal = false;
    this.editingCustomer = null;
  }

  saveEdit(): void {
    if (!this.editingCustomer) return;
    this.customerService.updateCustomer(this.editingCustomer).subscribe({
      next: () => {
        this.successMsg = 'Customer updated successfully.';
        this.closeEdit();
        this.loadCustomers();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.errorMsg = 'Update failed.'; }
    });
  }

  deleteCustomer(id: number): void {
    if (!confirm('Delete this customer?')) return;
    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        this.successMsg = 'Customer deleted.';
        this.loadCustomers();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.errorMsg = 'Delete failed.'; }
    });
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(name: string): string {
    const colors = ['#1a6fd4','#5c3dc8','#0d9488','#c05621','#2d6a4f','#6b21a8'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }
}
