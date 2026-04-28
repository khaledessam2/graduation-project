import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';
import { AdminStudentDto, AcademicRecord, AdminRegisteredCourse } from '../../models/admin/admin-student.model';

@Injectable({ providedIn: 'root' })
export class AdminStudentsService {
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

  getStudents(): Observable<AdminStudentDto[]> {
    return this.http.get<any>(`${this.apiUrl}/api/admin/students`, { headers: this.headers }).pipe(
      map((res) => {
        const list: any[] = res.data ?? res ?? [];
        return list.map((s) => ({
          studentId: s.universityId ?? s.studentId ?? s.student_id ?? s.university_id ?? '',
          name: s.name ?? '',
          email: s.email ?? '',
          department: s.department ?? '',
          gpa: s.gpa ?? 0,
          passedHours: s.passedHours ?? s.passed_hours ?? 0,
          year: s.yearOfStudy ?? s.year_of_study ?? s.year ?? '',
          registeredCourses: (s.registeredCourses ?? []).map((c: any): AdminRegisteredCourse =>
            typeof c === 'string'
              ? { code: c, name: c, level: 0, term: 0, creditHours: 0, department: '' }
              : { code: c.code ?? '', name: c.name ?? '', level: c.level ?? 0, term: c.term ?? 0, creditHours: c.creditHours ?? 0, department: c.department ?? '' }
          ),
          password: s.password ?? '',
          academicHistory: (s.academicHistory ?? []).map(
            (r: any): AcademicRecord => ({
              courseCode: r.courseCode ?? r.course_code ?? '',
              semester: r.semester ?? '',
              grade: r.grade ?? 0,
              recognition: r.recognition ?? '',
            }),
          ),
        }));
      }),
    );
  }

  private toPayload(student: AdminStudentDto): any {
    return { ...student, registeredCourses: student.registeredCourses.map(c => c.code) };
  }

  createStudent(student: AdminStudentDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/admin/students`, this.toPayload(student), {
      headers: this.headers,
    });
  }

  updateStudent(id: string, student: AdminStudentDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/admin/students/${id}`, this.toPayload(student), {
      headers: this.headers,
    });
  }

  deleteStudent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/admin/students/${id}`, {
      headers: this.headers,
    });
  }
}
