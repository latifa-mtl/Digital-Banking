import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { ChatBot } from './components/chat-bot/chat-bot';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'customers',
    loadComponent: () => import('./components/customers/customers').then(m => m.Customers),
    canActivate: [authGuard]
  },
  {
    path: 'accounts',
    loadComponent: () => import('./components/accounts/accounts').then(m => m.Accounts),
    canActivate: [authGuard]
  },
  {
    path: 'accounts/:id',
    loadComponent: () => import('./components/accounts/account-detail/account-detail').then(m => m.AccountDetail),
    canActivate: [authGuard]
  },
  {
    path: 'chatbot',
    component: ChatBot
  },
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found').then(m => m.NotFound)
  }
];