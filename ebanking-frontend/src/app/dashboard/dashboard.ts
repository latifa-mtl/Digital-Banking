import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { DashboardDTO } from '../model/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  data: DashboardDTO | null = null;
  loading = true;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: () => { this.error = 'Cannot reach the server. Make sure Spring Boot is running on port 8080.'; this.loading = false; }
    });
  }

  currentPct(): number { return this.data?.totalAccounts ? (this.data.currentAccounts / this.data.totalAccounts) * 100 : 0; }
  savingPct(): number  { return this.data?.totalAccounts ? (this.data.savingAccounts  / this.data.totalAccounts) * 100 : 0; }
  activePct(): number  { return this.data?.totalAccounts ? (this.data.activeAccounts  / this.data.totalAccounts) * 100 : 0; }
  flowPct(): number {
    const total = (this.data?.totalDebitAmount ?? 0) + (this.data?.totalCreditAmount ?? 0);
    return total ? ((this.data?.totalCreditAmount ?? 0) / total) * 100 : 50;
  }

  getInitial(name: string): string { return name ? name.charAt(0).toUpperCase() : '?'; }
  avatarColor(name: string): string {
    const colors = ['#1a6fd4','#5c3dc8','#0d9488','#c05621','#2d6a4f','#1a4a8a'];
    return colors[name.charCodeAt(0) % colors.length];
  }
  statusClass(s: string): string { return ({ACTIVATED:'active',SUSPENDED:'suspended',CREATED:'created'} as any)[s]??''; }
  typeLabel(t: string): string { return t === 'CurrentAccount' ? 'Current' : 'Savings'; }
  typeClass(t: string): string { return t === 'CurrentAccount' ? 'current' : 'saving'; }
}