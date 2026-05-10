import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/** List of URL fragments that must NEVER receive the Authorization header */
const PUBLIC_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth = inject(AuthService);

  // ✅ Skip token injection for public endpoints
  const isPublic = PUBLIC_URLS.some(url => req.url.includes(url));
  if (isPublic) {
    console.log('Interceptor: skipping token for public URL:', req.url);
    return next(req);
  }

  const token = auth.getToken();
  if (!token) {
    return next(req);
  }

  // Clone request and attach Bearer token
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq);
};
