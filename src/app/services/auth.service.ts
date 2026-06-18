import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { Student } from '../models/student/student.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'unismart_user';
  private readonly TOKEN_KEY = 'unismart_token';
  private readonly UID_KEY = 'unismart_uid';
  readonly apiUrl = environment.apiUrl;

  currentUser = signal<Student | null>(this.loadUser());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private loadUser(): Student | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  getUniversityId(): string | null {
    return localStorage.getItem(this.UID_KEY);
  }

  login(
    universityId: string,
    password: string,
    role: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(`${this.apiUrl}/api/login`, { universityId, password, role }).pipe(
      map((res) => {
        localStorage.setItem(this.UID_KEY, universityId);

        // Spec: { success, data: { role, token } }
        // Fallback: { token, student: { name, gpa, department } }
        const data = res.data ?? res;
        const token = data.token ?? res.token;
        if (token) {
          localStorage.setItem(this.TOKEN_KEY, token);
        }

        const resolvedRole = ((data.role ?? role) as string).toLowerCase() as 'student' | 'admin';
        const s = data.studentData ?? data.student ?? res.student ?? {};
        const user: Student = {
          id: 0,
          name: s.name ?? '',
          department: s.department ?? '',
          gpa: s.gpa ?? 0,
          studentId: universityId,
          nationalId: universityId,
          email: '',
          yearOfStudy: '',
          passedHours: 0,
          availableHours: 0,
          role: resolvedRole,
          status: (s.status ?? 'REGULAR') as Student['status'],
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        this.currentUser.set(user);

        return { success: true, message: res.message ?? 'Login successful.' };
      }),
      catchError((err) => {
        const message =
          err.error?.message ?? err.error?.detail ?? 'Login failed. Please check your credentials.';
        return of({ success: false, message });
      }),
    );
  }

  /** Called after dashboard/profile loads to sync student data into the user signal */
  updateStats(gpa: number, passedHours: number, availableHours: number, name?: string, extra?: Partial<Student>): void {
    const user = this.currentUser();
    if (!user) return;
    const updated: Student = { ...user, gpa, passedHours, availableHours, ...(name ? { name } : {}), ...(extra ?? {}) };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.currentUser.set(updated);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.UID_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
