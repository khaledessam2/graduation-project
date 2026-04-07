import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Grade } from '../models/models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

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
        university_id: this.auth.getUniversityId(),
      })
      .pipe(
        tap((res) => {
          const raw: any[] = res.grades ?? (Array.isArray(res) ? res : []);
          this.grades.set(
            raw.map((g, i) => ({
              id: i + 1,
              courseName: g.course_name ?? g.courseName ?? '',
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
