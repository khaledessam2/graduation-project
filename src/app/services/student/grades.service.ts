import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Grade } from '../../models/student/grade.model';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GradesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = environment.apiUrl;

  grades = signal<Grade[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadGrades(): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<any>(`${this.apiUrl}/api/grades`, {
        universityId: this.auth.getUniversityId(),
      })
      .pipe(
        tap((res) => {
          // Spec: { success, data: [{ courseCode, semester, grade, recognition }] }
          const data = res.data ?? res;
          const raw: any[] = Array.isArray(data) ? data : (data.grades ?? []);
          this.grades.set(
            raw.map((g, i) => ({
              id: i + 1,
              courseName: g.courseName ?? g.course_name ?? g.courseCode ?? g.course_code ?? '',
              semester: g.semester ?? '',
              grade: g.grade ?? g.numeric_grade ?? 0,
              recognition: g.recognition ?? g.letter_grade ?? '',
            }))
          );
          this.loading.set(false);
        }),
        catchError((err) => {
          this.error.set(err.error?.message ?? 'Failed to load grades');
          this.loading.set(false);
          return of(null);
        })
      );
  }
}
