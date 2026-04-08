import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.start();

  const apiReq = req.clone({
    setHeaders: { 'Content-Type': 'application/json' },
  });

  return next(apiReq).pipe(finalize(() => loading.stop()));
};
