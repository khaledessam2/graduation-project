import { Component, inject, computed, signal, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RegistrationService } from '../../../services/student/registration.service';
import { AuthService } from '../../../services/auth.service';
import { GradesService } from '../../../services/student/grades.service';
import { Course } from '../../../models/student/course.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-register-courses',
  imports: [TranslateModule, PaginationComponent],
  templateUrl: './register-courses.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RegisterCoursesComponent implements OnInit {
  registrationService = inject(RegistrationService);
  auth = inject(AuthService);
  private gradesService = inject(GradesService);
  private translate = inject(TranslateService);
  private toast = inject(MessageService);

  courses = this.registrationService.availableCourses;
  pendingIds = this.registrationService.pendingCourseIds;

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedCourses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.courses().slice(start, start + this.pageSize);
  });

  selectedCourse = signal<Course | null>(null);
  private courseHistory = signal<Course[]>([]);
  hasHistory = computed(() => this.courseHistory().length > 0);
  confirmMsg = signal('');
  confirmSuccess = signal(false);

  availableHours = computed(() => this.auth.currentUser()?.availableHours ?? 18);
  pendingCount = computed(() => this.pendingIds().length);
  pendingHoursTotal = computed(() => this.registrationService.pendingHours);

  ngOnInit(): void {
    this.registrationService.loadAvailableCourses().subscribe();
    this.gradesService.loadGrades().subscribe();
  }

  isRegistered(courseId: number): boolean {
    return this.pendingIds().includes(courseId);
  }

  register(course: Course): void {
    if (!this.isRegistered(course.id)) {
      this.registrationService.registerCourse(course.id);
      this.toast.add({
        severity: 'success',
        summary: this.translate.instant('REGISTER.TOAST_TITLE'),
        detail: this.translate.instant('REGISTER.TOAST_MSG', { course: course.name }),
        life: 3000,
      });
    } else {
      this.registrationService.unregisterCourse(course.id);
      this.toast.add({
        severity: 'warn',
        summary: this.translate.instant('REGISTER.UNREGISTER_TOAST_TITLE'),
        detail: this.translate.instant('REGISTER.UNREGISTER_TOAST_MSG', { course: course.name }),
        life: 3000,
      });
    }
  }

  openPrereqModal(course: Course): void {
    if (this.selectedCourse()) {
      this.courseHistory.update(h => [...h, this.selectedCourse()!]);
    } else {
      this.courseHistory.set([]);
    }
    this.selectedCourse.set(course);
  }

  goBack(): void {
    const history = this.courseHistory();
    if (history.length > 0) {
      this.selectedCourse.set(history[history.length - 1]);
      this.courseHistory.set(history.slice(0, -1));
    } else {
      this.selectedCourse.set(null);
    }
  }

  closePrereqModal(): void {
    this.selectedCourse.set(null);
    this.courseHistory.set([]);
  }

  confirm(): void {
    if (this.pendingIds().length === 0) {
      this.confirmSuccess.set(false);
      this.confirmMsg.set(this.translate.instant('REGISTER.NO_COURSES_SELECTED'));
      return;
    }
    this.registrationService.confirmRegistration().subscribe((res) => {
      if (res?.success === false) {
        this.confirmSuccess.set(false);
        this.confirmMsg.set(res.message ?? this.translate.instant('REGISTER.ERROR'));
      } else {
        this.confirmSuccess.set(true);
        this.confirmMsg.set(this.translate.instant('REGISTER.SUCCESS'));
        setTimeout(() => this.confirmMsg.set(''), 3000);
        this.registrationService.loadAvailableCourses().subscribe();
      }
    });
  }

  isPrereqPassed(prereq: string): boolean {
    const q = prereq.toLowerCase().trim();
    return this.gradesService.grades().some(g =>
      g.courseName.toLowerCase().includes(q) || q.includes(g.courseName.toLowerCase())
    );
  }

  findCourseByPrereq(prereq: string): Course | undefined {
    const q = prereq.toLowerCase().trim();
    return this.courses().find(c =>
      c.code.toLowerCase() === q ||
      c.name.toLowerCase() === q ||
      c.name.toLowerCase().includes(q) ||
      q.includes(c.name.toLowerCase())
    );
  }

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      Available: 'bg-green-100 text-green-800',
      Full: 'bg-orange-100 text-orange-800',
      Closed: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }
}
