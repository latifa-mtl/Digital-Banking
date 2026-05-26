import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, AuthResponse, AppUser, ChangePasswordRequest } from '../models/auth.model';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private apiUrl = `${environment.backendHost}`;

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.loadFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadFromStorage(): AuthResponse | null {
    if (!this.isBrowser) return null;

    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('auth_token');
        return null;
      }
      return JSON.parse(localStorage.getItem('auth_user') || 'null');
    } catch {
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (this.isBrowser) {
          const decoded: any = jwtDecode(response.accessToken);

          console.log('decoded token:', decoded);
          console.log('scope:', decoded.scope);

          // Extract roles from the JWT scope claim directly
          const roles: string[] = decoded.scope
            ? decoded.scope.split(' ').map((r: string) => r.trim()).filter(Boolean)
            : [];

          console.log('extracted roles:', roles);

          const user: AuthResponse = {
            accessToken: response.accessToken,
            username: decoded.sub,
            roles: roles   // ← from JWT, not from response.roles
          };

          localStorage.setItem('auth_token', response.accessToken);
          localStorage.setItem('auth_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('auth_token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user?.roles) return false;
    const rolesArray = Array.isArray(user.roles)
      ? user.roles
      : String(user.roles).split(' ');
    return rolesArray.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasRole('ROLE_ADMIN');
  }

  getUsername(): string {
    return this.getCurrentUser()?.username ?? '';
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/change-password`, request);
  }

  getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.apiUrl}/auth/users`);
  }

  saveUser(user: Partial<AppUser>): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.apiUrl}/auth/users`, user);
  }

  addRoleToUser(username: string, roleName: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/addRoleToUser`, { username, roleName });
  }
}
