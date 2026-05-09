  import { Injectable } from '@angular/core';
  import { HttpClient, HttpParams } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { Customer } from '../model/customer.model';

  @Injectable({ providedIn: 'root' })
  export class CustomerService {
    private baseUrl = 'http://localhost:8080';

    constructor(private http: HttpClient) {}

    getCustomers(): Observable<Customer[]> {
      return this.http.get<Customer[]>(`${this.baseUrl}/customers`);
    }

    searchCustomers(keyword: string): Observable<Customer[]> {
      return this.http.get<Customer[]>(`${this.baseUrl}/customers/search`, {
        params: new HttpParams().set('keyword', keyword)
      });
    }

    getCustomer(id: number): Observable<Customer> {
      return this.http.get<Customer>(`${this.baseUrl}/customers/${id}`);
    }

    saveCustomer(customer: Customer): Observable<Customer> {
      return this.http.post<Customer>(`${this.baseUrl}/customers`, customer);
    }

    updateCustomer(customer: Customer): Observable<Customer> {
      return this.http.put<Customer>(`${this.baseUrl}/customers/${customer.id}`, customer);
    }

    deleteCustomer(id: number): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/customers/${id}`);
    }
  }
