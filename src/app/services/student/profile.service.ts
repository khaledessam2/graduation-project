import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Student } from '../../models/student/student.model';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = environment.apiUrl;

  profile = signal<Student | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  loadProfile(): Observable<void> {
    const uid = this.auth.getUniversityId();
    if (!uid) return of(undefined as void);

    this.loading.set(true);
    this.error.set(null);

    return this.http.post<any>(`${this.apiUrl}/api/profile`, { universityId: uid }).pipe(
      tap((res) => {
        // Spec: { success, data: { name, email, yearOfStudy, department, studentId, gpa } }
        const p = res.data ?? res.profile ?? res.student ?? res;
        const current = this.auth.currentUser();
        const student: Student = {
          id: 0,
          name: p.name ?? current?.name ?? '',
          nationalId: uid,
          email: p.email ?? current?.email ?? '',
          yearOfStudy: p.yearOfStudy ?? p.year_of_study ?? current?.yearOfStudy ?? '',
          department: p.department ?? current?.department ?? '',
          studentId: p.studentId ?? p.student_id ?? uid,
          gpa: p.gpa ?? current?.gpa ?? 0,
          passedHours: p.passedHours ?? p.passed_hours ?? current?.passedHours ?? 0,
          availableHours: p.availableHours ?? p.available_hours ?? current?.availableHours ?? 18,
          role: 'student',
        };
        this.profile.set(student);
        this.auth.updateStats(student.gpa, student.passedHours, student.availableHours);
        this.loading.set(false);
      }),
      catchError((err) => {
        this.error.set(err.error?.message ?? 'Failed to load profile');
        this.loading.set(false);
        return of(undefined as void);
      })
    );
  }
}
