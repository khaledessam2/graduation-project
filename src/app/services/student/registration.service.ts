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
  serverMessage = signal<string | null>(null);

  loadAvailableCourses(level?: number | string, term?: number | string): Observable<any> {
    this.loading.set(true);
    this.error.set(null);
    this.serverMessage.set(null);

    const body: Record<string, any> = { universityId: this.auth.getUniversityId() };
    if (level != null) body['level'] = level;
    if (term != null) body['term'] = term;

    return this.http
      .post<any>(`${this.apiUrl}/api/courses/available`, body)
      .pipe(
        tap((res) => {
          // Spec: { success, data: [{ ...Course, isLocked, lockReason }] }
          const data = res.data ?? res;
          const raw: any[] = Array.isArray(data)
            ? data
            : (data.courses ?? data.available_courses ?? []);

          if (raw.length === 0 && res.message) {
            this.serverMessage.set(res.message);
          }

          this.availableCourses.set(
            raw.map((c, i) => ({
              id: i + 1,
              code: c.code ?? c.course_code ?? '',
              name: c.name ?? c.course_name ?? '',
              creditHours: c.credits ?? c.creditHours ?? c.credit_hours ?? 3,
              level: c.level,
              term: c.term,
              department: c.department ?? c.dept ?? '',
              capacity: c.capacity ?? 0,
              prerequisites: Array.isArray(c.prerequisites)
                ? c.prerequisites
                : c.prerequisites
                  ? String(c.prerequisites)
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                  : [],
              status: c.status ?? 'Available',
              professor: c.professor ?? '',
              isLocked: c.isLocked ?? false,
              lockReason: c.lockReason ?? null,
            })),
          );
          this.loading.set(false);
        }),
        catchError((err) => {
          this.error.set(err.error?.message ?? 'Failed to load courses');
          this.loading.set(false);
          return of(null);
        }),
      );
  }

  registerCourse(courseId: number): Observable<any> {
    const course = this.availableCourses().find((c) => c.id === courseId);
    if (!course) return of({ success: false });

    return this.http
      .post<any>(`${this.apiUrl}/api/register-course`, {
        universityId: this.auth.getUniversityId(),
        requestedCourses: [course.code],
      })
      .pipe(
        tap(() => {
          const current = this.pendingCourseIds();
          if (!current.includes(courseId)) {
            this.pendingCourseIds.set([...current, courseId]);
          }
        }),
        catchError((err) => {
          const msg = err.error?.message ?? 'Registration failed';
          this.error.set(msg);
          return of({ success: false, message: msg });
        }),
      );
  }

  unregisterCourse(courseId: number): void {
    this.pendingCourseIds.set(this.pendingCourseIds().filter((id) => id !== courseId));
  }

  get pendingHours(): number {
    return this.pendingCourseIds().reduce((sum, id) => {
      const c = this.availableCourses().find((x) => x.id === id);
      return sum + (c ? c.creditHours : 0);
    }, 0);
  }
}
