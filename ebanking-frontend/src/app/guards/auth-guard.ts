import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const loggedIn = auth.isLoggedIn();

  if (loggedIn) return true;

  // Store attempted URL so we can redirect after login
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};