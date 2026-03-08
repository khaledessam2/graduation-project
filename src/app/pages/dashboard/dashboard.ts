import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, TranslateModule, ConfirmDialog],
  templateUrl: './dashboard.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent {
  auth = inject(AuthService);
  courseService = inject(CourseService);
  confirmationService = inject(ConfirmationService);
  translate = inject(TranslateService);

  student = this.auth.currentUser;

  registeredCourses = this.courseService.registeredCourses;

  usedHours = computed(() => this.courseService.totalRegisteredHours);

  usedPercent = computed(() => {
    const avail = this.student()?.availableHours ?? 1;
    return Math.min(100, Math.round((this.usedHours() / avail) * 100));
  });

  deleteCourse(id: number): void {
    this.confirmationService.confirm({
      message: this.translate.instant('DASHBOARD.DELETE_CONFIRM_MESSAGE'),
      header: this.translate.instant('DASHBOARD.DELETE_CONFIRM_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translate.instant('DASHBOARD.YES'),
      rejectLabel: this.translate.instant('DASHBOARD.NO'),
      accept: () => {
        this.courseService.deleteCourse(id);
      },
    });
  }

  downloadPdf(): void {
    window.print();
  }
}
