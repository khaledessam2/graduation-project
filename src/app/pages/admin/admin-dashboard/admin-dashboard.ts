import { Component, inject, signal, computed, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { AdminStatsService } from '../../../services/admin/admin-stats.service';
import { AdminRegistrationStatusService } from '../../../services/admin/admin-registration-status.service';
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
  private statsService  = inject(AdminStatsService);
  private regStatusSvc  = inject(AdminRegistrationStatusService);

  loading = signal(false);
  loadError = signal('');

  stats = signal({
    totalStudents: 0,
    totalCourses: 0,
    activeRegistrations: 0,
    departmentsCount: 0,
  });

  recentRegistrations = signal<RecentRegistration[]>([]);
  searchQuery = signal('');

  registrationStatus = signal<'open' | 'closed' | null>(null);
  statusLoading = signal(false);
  statusError = signal('');

  filteredRegistrations = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.recentRegistrations();
    return this.recentRegistrations().filter(r =>
      r.studentName?.toLowerCase().includes(q) ||
      r.studentId?.toString().toLowerCase().includes(q) ||
      r.courseName?.toLowerCase().includes(q) ||
      r.courseCode?.toLowerCase().includes(q)
    );
  });

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

    this.regStatusSvc.getStatus().subscribe({
      next: (status) => this.registrationStatus.set(status),
      error: () => {},
    });
  }

  toggleRegistration(): void {
    const current = this.registrationStatus();
    if (current === null || this.statusLoading()) return;

    const next: 'open' | 'closed' = current === 'open' ? 'closed' : 'open';
    this.statusLoading.set(true);
    this.statusError.set('');

    this.regStatusSvc.setStatus(next).subscribe({
      next: (updated) => {
        this.registrationStatus.set(updated);
        this.statusLoading.set(false);
      },
      error: () => {
        this.statusError.set('ADMIN.REG_STATUS_ERROR');
        this.statusLoading.set(false);
      },
    });
  }
}
