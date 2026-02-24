import { Component, inject, computed, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register-courses',
  imports: [TranslateModule],
  templateUrl: './register-courses.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RegisterCoursesComponent {
  courseService = inject(CourseService);
  auth = inject(AuthService);
  private translate = inject(TranslateService);

  courses = this.courseService.availableCourses;
  pendingIds = this.courseService.pendingCourseIds;

  expandedRequirements = signal<number | null>(null);
  confirmMsg = signal('');

  availableHours = computed(() => this.auth.currentUser()?.availableHours ?? 18);

  pendingCount = computed(() => this.pendingIds().length);
  pendingHoursTotal = computed(() => this.courseService.pendingHours);

  isRegistered(courseId: number): boolean {
    return this.pendingIds().includes(courseId);
  }

  register(course: Course): void {
    if (!this.isRegistered(course.id)) {
      this.courseService.registerCourse(course.id);
    } else {
      this.courseService.unregisterCourse(course.id);
    }
  }

  toggleRequirements(courseId: number): void {
    this.expandedRequirements.set(
      this.expandedRequirements() === courseId ? null : courseId
    );
  }

  confirm(): void {
    if (this.pendingIds().length === 0) {
      this.confirmMsg.set(this.translate.instant('REGISTER.NO_COURSES_SELECTED'));
      return;
    }
    this.courseService.confirmRegistration();
    this.confirmMsg.set(this.translate.instant('REGISTER.SUCCESS'));
    setTimeout(() => this.confirmMsg.set(''), 3000);
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      'Available': 'bg-green-100 text-green-800',
      'Full':      'bg-orange-100 text-orange-800',
      'Closed':    'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }
}
