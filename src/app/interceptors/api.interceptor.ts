import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  const auth = inject(AuthService);
  loading.start();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (req.url.startsWith(environment.apiUrl)) {
    const token = auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const role = auth.currentUser()?.role;
    if (role) headers['x-user-role'] = role;
  }

  return next(req.clone({ setHeaders: headers })).pipe(finalize(() => loading.stop()));
};
