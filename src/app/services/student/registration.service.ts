import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Course } from '../../models/student/course.model';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = environment.apiUrl;

  availableCourses = signal<Course[]>([]);
  pendingCourseIds = signal<number[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAvailableCourses(): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<any>(`${this.apiUrl}/api/courses/available`, {
        universityId: this.auth.getUniversityId(),
      })
      .pipe(
        tap((res) => {
          // Spec: { success, data: [{ ...Course, isLocked, lockReason }] }
          const data = res.data ?? res;
          const raw: any[] = Array.isArray(data) ? data : (data.courses ?? data.available_courses ?? []);
          this.availableCourses.set(
            raw.map((c, i) => ({
              id: i + 1,
              code: c.code ?? c.course_code ?? '',
              name: c.name ?? c.course_name ?? '',
              creditHours: c.credits ?? c.creditHours ?? c.credit_hours ?? 3,
              level: c.level ?? 0,
              capacity: c.capacity ?? 0,
              prerequisites: Array.isArray(c.prerequisites)
                ? c.prerequisites
                : c.prerequisites
                  ? String(c.prerequisites).split(',').map((s: string) => s.trim()).filter(Boolean)
                  : [],
              status: c.status ?? 'Available',
              professor: c.professor ?? '',
              isLocked: c.isLocked ?? false,
              lockReason: c.lockReason ?? null,
            }))
          );
          this.loading.set(false);
        }),
        catchError((err) => {
          this.error.set(err.error?.message ?? 'Failed to load courses');
          this.loading.set(false);
          return of(null);
        })
      );
  }

  registerCourse(courseId: number): void {
    const current = this.pendingCourseIds();
    if (!current.includes(courseId)) {
      this.pendingCourseIds.set([...current, courseId]);
    }
  }

  unregisterCourse(courseId: number): void {
    this.pendingCourseIds.set(this.pendingCourseIds().filter((id) => id !== courseId));
  }

  confirmRegistration(): Observable<any> {
    const codes = this.pendingCourseIds()
      .map((id) => this.availableCourses().find((c) => c.id === id)?.code)
      .filter(Boolean) as string[];

    return this.http
      .post<any>(`${this.apiUrl}/api/register-course`, {
        universityId: this.auth.getUniversityId(),
        requestedCourses: codes,
      })
      .pipe(
        tap(() => {
          this.pendingCourseIds.set([]);
        }),
        catchError((err) => {
          const msg = err.error?.message ?? 'Registration failed';
          this.error.set(msg);
          return of({ success: false, message: msg });
        })
      );
  }

  get pendingHours(): number {
    return this.pendingCourseIds().reduce((sum, id) => {
      const c = this.availableCourses().find((x) => x.id === id);
      return sum + (c ? c.creditHours : 0);
    }, 0);
  }
}
