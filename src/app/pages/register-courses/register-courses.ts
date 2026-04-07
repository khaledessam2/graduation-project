import { Component, inject, computed, signal, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register-courses',
  imports: [TranslateModule],
  templateUrl: './register-courses.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RegisterCoursesComponent implements OnInit {
  registrationService = inject(RegistrationService);
  auth = inject(AuthService);
  private translate = inject(TranslateService);
  private toast = inject(MessageService);

  courses = this.registrationService.availableCourses;
  pendingIds = this.registrationService.pendingCourseIds;

  expandedRequirements = signal<number | null>(null);
  confirmMsg = signal('');
  confirmSuccess = signal(false);

  availableHours = computed(() => this.auth.currentUser()?.availableHours ?? 18);
  pendingCount = computed(() => this.pendingIds().length);
  pendingHoursTotal = computed(() => this.registrationService.pendingHours);

  ngOnInit(): void {
    this.registrationService.loadAvailableCourses().subscribe();
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

  toggleRequirements(courseId: number): void {
    this.expandedRequirements.set(
      this.expandedRequirements() === courseId ? null : courseId
    );
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

  getStatusClasses(status: string): string {
    const map: Record<string, string> = {
      Available: 'bg-green-100 text-green-800',
      Full: 'bg-orange-100 text-orange-800',
      Closed: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }
}
