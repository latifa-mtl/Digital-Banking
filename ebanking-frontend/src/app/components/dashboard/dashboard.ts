import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard';
import { DashboardStats } from '../../models/dashboard.model';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = null;
  loading = false;
  error = '';
  username = '';
  currentDate = new Date();

  // Chart data for display
  chartMonths: string[] = [];
  chartValues: number[] = [];
  maxChartValue = 1;
  isAdmin = false;


  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = this.authService.isAdmin();
    });
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.buildChartData(data);
        this.loading = false;
      },
      error: () => {
        // Use mock data if backend not ready
        this.stats = this.getMockStats();
        this.buildChartData(this.stats);
        this.loading = false;
      }
    });
  }

  buildChartData(stats: DashboardStats): void {
    if (stats.operationsPerMonth) {
      this.chartMonths = Object.keys(stats.operationsPerMonth);
      this.chartValues = Object.values(stats.operationsPerMonth);
      this.maxChartValue = Math.max(...this.chartValues, 1);
    }
  }

  getBarHeight(val: number): number {
    return Math.round((val / this.maxChartValue) * 100);
  }

  getMockStats(): DashboardStats {
    return {
      totalCustomers: 3,
      totalAccounts: 6,
      totalOperations: 60,
      totalBalance: 2500000,
      totalCredits: 5400000,
      totalDebits: 890000,
      totalCurrentAccounts: 3,
      totalSavingAccounts: 3,
      operationsPerMonth: {
        'Jan': 8, 'Fév': 12, 'Mar': 15, 'Avr': 10, 'Mai': 18, 'Jun': 14
      },
      balancePerAccountType: {
        'Courant': 1200000,
        'Épargne': 1300000
      }
    };
  }

  formatAmount(val: number): string {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (val >= 1_000) return (val / 1_000).toFixed(0) + 'K';
    return val.toFixed(0);
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
}
