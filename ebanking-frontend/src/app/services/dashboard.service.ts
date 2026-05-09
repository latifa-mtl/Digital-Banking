import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardDTO } from '../model/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardDTO> {
    return this.http.get<DashboardDTO>(`${this.baseUrl}/dashboard`);
  }
}