import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';
import { AdminStats } from '../../models/admin/admin-stats.model';

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
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

  getStats(): Observable<AdminStats> {
    return this.http
      .post<any>(`${this.apiUrl}/api/admin/stats`, {}, { headers: this.headers })
      .pipe(
        map((res) => {
          const d = res.data ?? res;
          return {
            totalStudents:       d.totalStudents       ?? d.total_students       ?? 0,
            totalCourses:        d.totalCourses         ?? d.total_courses         ?? 0,
            activeRegistrations: d.activeRegistrations ?? d.active_registrations ?? 0,
            departmentsCount:    d.departmentsCount    ?? d.departments_count    ?? d.departments ?? 0,
            recentRegistrations: (d.recentRegistrations ?? d.recent_registrations ?? []).map((r: any) => ({
              studentId:   r.studentId   ?? r.student_id   ?? '',
              studentName: r.studentName ?? r.student_name ?? '',
              courseCode:  r.courseCode  ?? r.course_code  ?? '',
              courseName:  r.courseName  ?? r.course_name  ?? '',
              timestamp:   r.timestamp   ?? r.date         ?? '',
            })),
          };
        })
      );
  }
}
