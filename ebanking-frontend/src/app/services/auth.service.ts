import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest  { username: string; password: string; }
export interface LoginResponse { accessToken: string; username: string; roles: string; }
export interface UserProfile   { username: string; roles: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl  = 'http://localhost:8080';
  private TOKEN_KEY = 'accessToken';
  private USER_KEY  = 'authUser';

  constructor(private http: HttpClient) {
    // On startup, clear any expired token so isLoggedIn() is accurate
    this.clearIfExpired();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, request).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify({
          username: res.username,
          roles: this.parseRoles(res.roles)
        }));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      this.logout(); // clear corrupt token
      return false;
    }
  }

  getProfile(): UserProfile | null {
    const raw = localStorage.getItem(this.USER_KEY);
    try { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  hasRole(role: string): boolean {
    return this.getProfile()?.roles?.includes(role) ?? false;
  }

  private parseRoles(raw: string): string[] {
    if (!raw) return [];
    return raw.replace(/[\[\]]/g, '').split(',').map(r => r.trim()).filter(Boolean);
  }

  private clearIfExpired(): void {
    const token = this.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 <= Date.now()) this.logout();
    } catch {
      this.logout();
    }
  }
}
