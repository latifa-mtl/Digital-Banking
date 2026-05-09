import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../model/customer.model';

@Component({
  selector: 'app-new-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './new-customer.html',
  styleUrls: ['./new-customer.css']
})
export class NewCustomerComponent {
  customer: Customer = { name: '', email: '' };
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private customerService: CustomerService, private router: Router) {}

  submit(): void {
    if (!this.customer.name.trim() || !this.customer.email.trim()) {
      this.errorMsg = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    this.customerService.saveCustomer(this.customer).subscribe({
      next: () => {
        this.successMsg = 'Customer created successfully!';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/customers']), 1500);
      },
      error: () => {
        this.errorMsg = 'Failed to create customer.';
        this.loading = false;
      }
    });
  }

  reset(): void {
    this.customer = { name: '', email: '' };
    this.successMsg = '';
    this.errorMsg = '';
  }
}
