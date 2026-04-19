import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

export interface TimetableEntry {
  courseCode: string;
  courseName: string;
  day: string;
  time: string;
  location: string;
}

@Injectable({ providedIn: 'root' })
export class TimetableService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = environment.apiUrl;

  entries = signal<TimetableEntry[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadTimetable(): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .post<any>(`${this.apiUrl}/api/timetable`, {
        universityId: this.auth.getUniversityId(),
      })
      .pipe(
        tap((res) => {
          // Spec: { success, data: [{ courseCode, courseName, day, time, location }] }
          const data = res.data ?? res;
          const raw: any[] = Array.isArray(data) ? data : [];
          this.entries.set(
            raw.map((e) => ({
              courseCode: e.courseCode ?? e.course_code ?? '',
              courseName: e.courseName ?? e.course_name ?? '',
              day: e.day ?? '',
              time: e.time ?? '',
              location: e.location ?? '',
            })),
          );
          this.loading.set(false);
        }),
        catchError((err) => {
          this.error.set(err.error?.message ?? 'Failed to load timetable');
          this.loading.set(false);
          return of(null);
        }),
      );
  }
}
