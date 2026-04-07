import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { Student } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'unismart_user';
  private readonly TOKEN_KEY = 'unismart_token';
  private readonly UID_KEY = 'unismart_uid';
  readonly apiUrl = environment.apiUrl;

  currentUser = signal<Student | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

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

  login(university_id: string, password: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<any>(`${this.apiUrl}/api/login`, { university_id, password })
      .pipe(
        map((res) => {
          localStorage.setItem(this.UID_KEY, university_id);

          if (res.token) {
            localStorage.setItem(this.TOKEN_KEY, res.token);
          }

          // Login returns only: { student: { name, gpa, department }, token, message }
          // Remaining fields are filled later by profile/dashboard services
          const s = res.student ?? {};
          const user: Student = {
            id: 0,
            name: s.name ?? '',
            department: s.department ?? '',
            gpa: s.gpa ?? 0,
            studentId: university_id,
            nationalId: university_id,
            email: '',
            yearOfStudy: '',
            passedHours: 0,
            availableHours: 0,
            role: 'student',
          };

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          this.currentUser.set(user);

          return { success: true, message: res.message ?? 'Login successful.' };
        }),
        catchError((err) => {
          const message =
            err.error?.message ?? err.error?.detail ?? 'Login failed. Please check your credentials.';
          return of({ success: false, message });
        })
      );
  }

  /** Called after dashboard loads to sync GPA / hours into the user signal */
  updateStats(gpa: number, passedHours: number, availableHours: number): void {
    const user = this.currentUser();
    if (!user) return;
    const updated: Student = { ...user, gpa, passedHours, availableHours };
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
