import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminRegistrationStatusService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getStatus(): Observable<'open' | 'closed'> {
    return this.http
      .get<any>(`${this.apiUrl}/api/admin/registration-status`)
      .pipe(map((res) => res.data?.status ?? res.status));
  }

  setStatus(status: 'open' | 'closed'): Observable<'open' | 'closed'> {
    return this.http
      .post<any>(`${this.apiUrl}/api/admin/registration-status`, { status })
      .pipe(map((res) => res.data?.status ?? res.status));
  }
}
