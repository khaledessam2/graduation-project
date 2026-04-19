import { Component, inject, signal, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { AdminStatsService } from '../../../services/admin/admin-stats.service';
import { TranslateModule } from '@ngx-translate/core';
import { RecentRegistration } from '../../../models/admin/recent-registration.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [TranslateModule, DecimalPipe, DatePipe],
  templateUrl: './admin-dashboard.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminDashboardComponent implements OnInit {
  auth         = inject(AuthService);
  private statsService = inject(AdminStatsService);

  loading = signal(false);
  loadError = signal('');

  stats = signal({
    totalStudents: 0,
    totalCourses: 0,
    activeRegistrations: 0,
    departmentsCount: 0,
  });

  recentRegistrations = signal<RecentRegistration[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.loadError.set('');

    this.statsService.getStats().subscribe({
      next: (s) => {
        this.stats.set({
          totalStudents:       s.totalStudents,
          totalCourses:        s.totalCourses,
          activeRegistrations: s.activeRegistrations,
          departmentsCount:    s.departmentsCount,
        });
        this.recentRegistrations.set(s.recentRegistrations ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('ADMIN.ERROR_LOAD');
        this.loading.set(false);
      },
    });
  }
}
