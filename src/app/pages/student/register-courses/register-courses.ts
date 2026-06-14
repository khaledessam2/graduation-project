import { Component, inject, computed, signal, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegistrationService } from '../../../services/student/registration.service';
import { AuthService } from '../../../services/auth.service';
import { GradesService } from '../../../services/student/grades.service';
import { Course } from '../../../models/student/course.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-register-courses',
  imports: [TranslateModule, PaginationComponent, FormsModule, Select],
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

  filterLevel = signal<number | null>(null);
  filterTerm = signal<number | null>(null);
  filterDepartment = signal<string | null>(null);

  hasActiveFilter = computed(() =>
    this.filterLevel() !== null || this.filterTerm() !== null || this.filterDepartment() !== null
  );

  filteredCourses = computed(() => {
    const level = this.filterLevel();
    const term = this.filterTerm();
    const dept = this.filterDepartment();
    return this.courses().filter(c =>
      (level === null || c.level === level) &&
      (term === null || c.term === term) &&
      (dept === null || c.department === dept)
    );
  });

  availableLevels = computed(() =>
    [...new Set(this.courses().map(c => c.level))].sort((a, b) => a - b)
      .map(v => ({ label: `${this.translate.instant('REGISTER.LEVEL')} ${v}`, value: v }))
  );
  availableTerms = computed(() =>
    [...new Set(this.courses().map(c => c.term))].sort((a, b) => a - b)
      .map(v => ({ label: `${this.translate.instant('REGISTER.Term')} ${v}`, value: v }))
  );
  availableDepartments = computed(() =>
    [...new Set(this.courses().map(c => c.department).filter(Boolean))].sort()
      .map(v => ({ label: v, value: v }))
  );

  clearFilters(): void {
    this.filterLevel.set(null);
    this.filterTerm.set(null);
    this.filterDepartment.set(null);
    this.currentPage.set(1);
  }

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedCourses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCourses().slice(start, start + this.pageSize);
  });

  selectedCourse = signal<Course | null>(null);
  private courseHistory = signal<Course[]>([]);
  hasHistory = computed(() => this.courseHistory().length > 0);

  ngOnInit(): void {
    this.registrationService.loadAvailableCourses().subscribe();
    this.gradesService.loadGrades().subscribe();
  }

  isRegistered(courseId: number): boolean {
    return this.pendingIds().includes(courseId);
  }

  register(course: Course): void {
    if (!this.isRegistered(course.id)) {
      this.registrationService.registerCourse(course.id).subscribe((res: any) => {
        if (res?.success === false) {
          this.toast.add({
            severity: 'error',
            summary: this.translate.instant('REGISTER.TOAST_TITLE'),
            detail: res.message ?? this.translate.instant('REGISTER.ERROR'),
            life: 4000,
          });
        } else {
          this.toast.add({
            severity: 'success',
            summary: this.translate.instant('REGISTER.TOAST_TITLE'),
            detail: this.translate.instant('REGISTER.SUCCESS'),
            life: 4000,
          });
          this.registrationService.loadAvailableCourses().subscribe();
        }
      });
    } else {
      this.registrationService.unregisterCourse(course.id);
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
