import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, TranslateModule],
  templateUrl: './dashboard.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent {
  auth = inject(AuthService);
  courseService = inject(CourseService);

  student = this.auth.currentUser;

  registeredCourses = this.courseService.registeredCourses;

  usedHours = computed(() => this.courseService.totalRegisteredHours);

  usedPercent = computed(() => {
    const avail = this.student()?.availableHours ?? 1;
    return Math.min(100, Math.round((this.usedHours() / avail) * 100));
  });

  deleteCourse(id: number): void {
    this.courseService.deleteCourse(id);
  }

  downloadPdf(): void {
    window.print();
  }
}
