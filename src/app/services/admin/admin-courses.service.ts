import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminCourseDto } from '../../models/admin/admin-course.model';

@Injectable({ providedIn: 'root' })
export class AdminCoursesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCourses(): Observable<AdminCourseDto[]> {
    return this.http.get<any>(`${this.apiUrl}/api/admin/courses`).pipe(
      map((res) => {
        const list: any[] = res.data ?? res ?? [];
        return list.map((c) => ({
          code: c.code ?? '',
          name: c.name ?? c.course_name ?? '',
          creditHours: c.credits ?? c.creditHours ?? c.credit_hours ?? 3,
          level: c.level ?? 0,
          term: c.term ?? 1,
          department: c.department ?? '',
          professor: c.professor ?? '',
          status: c.status ?? 'Available',
          prerequisites: Array.isArray(c.prerequisites)
            ? (c.prerequisites as string[]).join(', ')
            : (c.prerequisites ?? ''),
          enrolled: c.currentEnrollment ?? c.enrolled ?? 0,
          capacity: c.capacity ?? 60,
        }));
      }),
    );
  }

  createCourse(course: AdminCourseDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/admin/courses`, course);
  }

  updateCourse(code: string, course: AdminCourseDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/admin/courses/${code}`, course);
  }

  deleteCourse(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/admin/courses/${code}`);
  }
}
