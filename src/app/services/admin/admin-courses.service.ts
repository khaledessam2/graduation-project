import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';
import { AdminCourseDto } from '../../models/admin/admin-course.model';

@Injectable({ providedIn: 'root' })
export class AdminCoursesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private get headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'x-user-role': 'admin',
    });
  }

  getCourses(): Observable<AdminCourseDto[]> {
    return this.http
      .get<any>(`${this.apiUrl}/api/admin/courses`, { headers: this.headers })
      .pipe(
        map((res) => {
          const list: any[] = res.data ?? res ?? [];
          return list.map((c) => ({
            code:          c.code          ?? '',
            name:          c.name          ?? c.course_name  ?? '',
            creditHours:   c.credits       ?? c.creditHours  ?? c.credit_hours ?? 3,
            level:         c.level         ?? 0,
            professor:     c.professor     ?? '',
            status:        c.status        ?? 'Available',
            prerequisites: Array.isArray(c.prerequisites)
              ? (c.prerequisites as string[]).join(', ')
              : (c.prerequisites ?? ''),
            enrolled:      c.currentEnrollment ?? c.enrolled ?? 0,
            capacity:      c.capacity      ?? 60,
          }));
        })
      );
  }

  createCourse(course: AdminCourseDto): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/api/admin/courses`,
      course,
      { headers: this.headers }
    );
  }

  updateCourse(code: string, course: AdminCourseDto): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/api/admin/courses/${code}`,
      course,
      { headers: this.headers }
    );
  }

  deleteCourse(code: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/api/admin/courses/${code}`,
      { headers: this.headers }
    );
  }
}
