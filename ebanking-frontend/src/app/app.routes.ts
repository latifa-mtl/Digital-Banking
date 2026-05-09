import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { CustomersComponent } from './customers/customers';
import { AccountsComponent } from './accounts/accounts';
import { NewCustomerComponent } from './new-customer/new-customer';
import { LoginComponent } from './login/login';
import { ProfileComponent } from './profile/profile';
import { authGuard } from './guards/auth-guard';
import { AuthService } from './services/auth.service';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.createUrlTree(['/dashboard']) : true;
};

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'dashboard',    component: DashboardComponent,    canActivate: [authGuard] },
  { path: 'customers',    component: CustomersComponent,    canActivate: [authGuard] },
  { path: 'accounts',     component: AccountsComponent,     canActivate: [authGuard] },
  { path: 'new-customer', component: NewCustomerComponent,  canActivate: [authGuard] },
  { path: 'profile',      component: ProfileComponent,      canActivate: [authGuard] },
];