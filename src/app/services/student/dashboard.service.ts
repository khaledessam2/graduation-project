import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { RegisteredCourse } from '../../models/student/registered-course.model';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = environment.apiUrl;

  registeredCourses = signal<RegisteredCourse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');

  loadDashboard(): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<any>(`${this.apiUrl}/api/dashboard`, {
        universityId: this.auth.getUniversityId(),
      })
      .pipe(
        tap((res) => {
          // Spec: { success, data: { gpa, availableHours, passedHours, registeredCoursesCount } }
          const data = res.data ?? res;
          const raw: any[] = data.registered_courses_details ?? data.registeredCoursesDetails ?? [];
          this.registeredCourses.set(
            raw.map((c, i) => ({
              id: i + 1,
              code: c.code ?? '',
              name: c.course_name ?? c.courseName ?? c.name ?? '',
              hours: c.hours ?? c.creditHours ?? c.credits ?? 3,
              professor: c.professor ?? '',
            })),
          );
          this.auth.updateStats(
            data.gpa ?? 0,
            data.passedHours ?? data.passed_hours ?? 0,
            data.availableHours ?? data.available_hours ?? 18,
          );
          this.loading.set(false);
        }),
        catchError((err) => {
          this.error.set(err.error?.message ?? 'Failed to load dashboard');
          this.loading.set(false);
          return of(null);
        }),
      );
  }

  deleteCourse(courseCode: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/api/unregister-course`, {
        universityId: this.auth.getUniversityId(),
        courseCode,
      })
      .pipe(
        tap(() => {
          this.registeredCourses.set(this.registeredCourses().filter((c) => c.code !== courseCode));
        }),
        catchError((err) => {
          this.error.set(err.error?.message ?? 'Failed to unregister course');
          return of(null);
        }),
      );
  }

  get totalRegisteredHours(): number {
    return this.registeredCourses().reduce((sum, c) => sum + c.hours, 0);
  }
}
