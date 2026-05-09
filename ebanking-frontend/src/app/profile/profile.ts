import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserProfile } from '../model/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  issuedAt: Date | null = null;
  expiresAt: Date | null = null;
  tokenPreview = '';
  tokenCopied = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // this.profile = this.authService.getProfile();
    this.parseToken();
  }

  private parseToken(): void {
    const token = this.authService.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.issuedAt  = new Date(payload.iat * 1000);
      this.expiresAt = new Date(payload.exp * 1000);
    } catch { /* ignore */ }

    // Show first 80 chars + ellipsis
    this.tokenPreview = token.length > 80 ? token.slice(0, 80) + '…' : token;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(username: string): string {
    return username.slice(0, 2).toUpperCase();
  }

  formatRole(role: string): string {
    return role.replace('ROLE_', '');
  }

  getRoleClass(role: string): string {
    return role.includes('ADMIN') ? 'admin' : 'user';
  }

  getPermissions(): { label: string; granted: boolean }[] {
    const roles = this.profile?.roles ?? [];
    const isAdmin = roles.some(r => r.includes('ADMIN'));
    const isUser  = roles.some(r => r.includes('USER'));
    return [
      { label: 'View Accounts',      granted: isUser || isAdmin },
      { label: 'Debit / Credit',     granted: isUser || isAdmin },
      { label: 'Transfer Funds',     granted: isUser || isAdmin },
      { label: 'Manage Customers',   granted: isAdmin },
      { label: 'Admin Dashboard',    granted: isAdmin },
    ];
  }

  copyToken(): void {
    const token = this.authService.getToken();
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
      this.tokenCopied = true;
      setTimeout(() => this.tokenCopied = false, 2000);
    });
  }
}