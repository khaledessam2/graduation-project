import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, TranslateModule, ConfirmDialog, Toast],
  providers: [MessageService],
  templateUrl: './dashboard.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  dashboardService = inject(DashboardService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  translate = inject(TranslateService);

  student = this.auth.currentUser;
  registeredCourses = this.dashboardService.registeredCourses;

  filteredCourses = computed(() => {
    const q = this.dashboardService.searchQuery().trim().toLowerCase();
    if (!q) return this.registeredCourses();
    return this.registeredCourses().filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.dashboardService.loadDashboard().subscribe();
  }

  usedHours = computed(() =>
    this.dashboardService.registeredCourses().reduce((sum, c) => sum + c.hours, 0)
  );

  usedPercent = computed(() => {
    const avail = this.student()?.availableHours ?? 1;
    return Math.min(100, Math.round((this.usedHours() / avail) * 100));
  });

  deleteCourse(courseCode: string): void {
    this.confirmationService.confirm({
      message: this.translate.instant('DASHBOARD.DELETE_CONFIRM_MESSAGE'),
      header: this.translate.instant('DASHBOARD.DELETE_CONFIRM_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translate.instant('DASHBOARD.YES'),
      rejectLabel: this.translate.instant('DASHBOARD.NO'),
      accept: () => {
        this.dashboardService.deleteCourse(courseCode).subscribe((res) => {
          if (res !== null) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('DASHBOARD.DROP_SUCCESS_TITLE'),
              detail: this.translate.instant('DASHBOARD.DROP_SUCCESS_MSG'),
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('DASHBOARD.DROP_ERROR_TITLE'),
              detail: this.dashboardService.error() ?? this.translate.instant('DASHBOARD.DROP_ERROR_MSG'),
            });
          }
        });
      },
    });
  }

  downloadPdf(): void {
    window.print();
  }
}
