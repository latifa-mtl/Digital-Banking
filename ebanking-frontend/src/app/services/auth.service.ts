import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserProfile } from '../model/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080';
  private TOKEN_KEY = 'accessToken';
  private USER_KEY = 'authUser';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, request).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify({ username: res.username, roles: this.parseRoles(res.roles) }));
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
      return false;
    }
  }

  getProfile(): UserProfile | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  hasRole(role: string): boolean {
    const profile = this.getProfile();
    return profile?.roles?.includes(role) ?? false;
  }

  /** Converts the stringified array "[ROLE_USER, ROLE_ADMIN]" → string[] */
  private parseRoles(raw: string): string[] {
    return raw.replace(/[\[\]]/g, '').split(',').map(r => r.trim()).filter(Boolean);
  }
}