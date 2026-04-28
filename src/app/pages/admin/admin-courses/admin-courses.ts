import { Component, signal, computed, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { AdminCourseFormComponent } from './admin-course-form/admin-course-form.component';
import { AdminCoursesService } from '../../../services/admin/admin-courses.service';
import { AdminCourseDto } from '../../../models/admin/admin-course.model';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Select } from 'primeng/select';

const LEVEL_LABELS: Record<number, string> = { 1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع' };
const TERM_LABELS:  Record<number, string> = { 1: 'الأول', 2: 'الثاني' };

const EMPTY_FORM = (): Omit<AdminCourseDto, 'enrolled'> => ({
  code: '', name: '', creditHours: 3, level: 1, term: 1, department: '',
  professor: '', status: 'Available', prerequisites: '', capacity: 60,
});

@Component({
  selector: 'app-admin-courses',
  imports: [FormsModule, TranslateModule, PaginationComponent, AdminCourseFormComponent, ConfirmDialog, Select],
  templateUrl: './admin-courses.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminCoursesComponent implements OnInit {
  private coursesService      = inject(AdminCoursesService);
  private confirmationService = inject(ConfirmationService);
  private translate           = inject(TranslateService);

  searchQuery      = signal('');
  filterLevel      = signal<number | null>(null);
  filterTerm       = signal<number | null>(null);
  filterDepartment = signal<string | null>(null);

  showModal        = signal(false);
  editMode         = signal(false);
  editOriginalCode = signal('');
  formError        = signal('');
  form             = signal(EMPTY_FORM());
  loading          = signal(false);
  saving           = signal(false);

  readonly levelLabels = LEVEL_LABELS;
  readonly termLabels  = TERM_LABELS;

  readonly levelOptions = [
    { label: 'الأول',  value: 1 },
    { label: 'الثاني', value: 2 },
    { label: 'الثالث', value: 3 },
    { label: 'الرابع', value: 4 },
  ];
  readonly termOptions = [
    { label: 'الأول',  value: 1 },
    { label: 'الثاني', value: 2 },
  ];

  statusOptions: { value: AdminCourseDto['status']; labelKey: string }[] = [
    { value: 'Available', labelKey: 'ADMIN.AVAILABLE' },
    { value: 'Closed',    labelKey: 'ADMIN.CLOSED'    },
  ];

  courses = signal<AdminCourseDto[]>([]);

  departmentOptions = computed(() =>
    [...new Set(this.courses().map((c) => c.department).filter(Boolean))].sort()
      .map(v => ({ label: v, value: v }))
  );

  hasActiveFilters = computed(() =>
    this.filterLevel() !== null || this.filterTerm() !== null || this.filterDepartment() !== null
  );

  filteredCourses = computed(() => {
    const q    = this.searchQuery().trim().toLowerCase();
    const lvl  = this.filterLevel();
    const term = this.filterTerm();
    const dept = this.filterDepartment();
    return this.courses().filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
      if (lvl  !== null && c.level      !== lvl)  return false;
      if (term !== null && c.term       !== term)  return false;
      if (dept != null && c.department !== dept)    return false;
      return true;
    });
  });

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedCourses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCourses().slice(start, start + this.pageSize);
  });

  availableCount = computed(() => this.courses().filter((c) => c.status === 'Available').length);
  closedCount    = computed(() => this.courses().filter((c) => c.status === 'Closed').length);

  ngOnInit(): void {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.loading.set(true);
    this.coursesService.getCourses().subscribe({
      next: (list) => {
        this.courses.set(list.map(c => ({
          ...c,
          prerequisites: c.prerequisites
            ? c.prerequisites.replace(/[{}]/g, '')
            : c.prerequisites,
        })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(value: string): void { this.searchQuery.set(value); this.currentPage.set(1); }

  onFilterChange(): void { this.currentPage.set(1); }

  resetFilters(): void {
    this.filterLevel.set(null);
    this.filterTerm.set(null);
    this.filterDepartment.set(null);
    this.currentPage.set(1);
  }

  onFormChange(ev: { key: string; value: any }): void {
    this.updateField(ev.key as any, ev.value);
  }

  openAddModal(): void {
    this.form.set(EMPTY_FORM());
    this.formError.set('');
    this.editMode.set(false);
    this.editOriginalCode.set('');
    this.showModal.set(true);
  }

  openEditModal(course: AdminCourseDto): void {
    this.form.set({ ...course });
    this.formError.set('');
    this.editMode.set(true);
    this.editOriginalCode.set(course.code);
    this.showModal.set(true);
  }

  closeModal(): void {
    if (!this.saving()) this.showModal.set(false);
  }

  updateField<K extends keyof ReturnType<typeof EMPTY_FORM>>(
    key: K, value: ReturnType<typeof EMPTY_FORM>[K]
  ): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  submitForm(): void {
    const f = this.form();
    if (!f.code.trim() || !f.name.trim() || !f.professor.trim() || !f.capacity) {
      this.formError.set('ADMIN.FILL_REQUIRED');
      return;
    }
    const upperCode = f.code.trim().toUpperCase();
    const duplicate = this.courses().some(
      (c) => c.code.toUpperCase() === upperCode && c.code !== this.editOriginalCode()
    );
    if (duplicate) { this.formError.set('ADMIN.CODE_EXISTS'); return; }

    const existing = this.courses().find((c) => c.code === this.editOriginalCode());
    const payload: AdminCourseDto = {
      ...f,
      code:        upperCode,
      creditHours: Number(f.creditHours),
      capacity:    Number(f.capacity),
      enrolled:    this.editMode() ? (existing?.enrolled ?? 0) : 0,
    };

    this.saving.set(true);
    this.formError.set('');

    if (this.editMode()) {
      this.coursesService.updateCourse(this.editOriginalCode(), payload).subscribe({
        next: () => {
          this.courses.update((list) =>
            list.map((c) => c.code === this.editOriginalCode() ? payload : c)
          );
          this.saving.set(false);
          this.showModal.set(false);
        },
        error: () => {
          this.formError.set('ADMIN.ERROR_SAVE');
          this.saving.set(false);
        },
      });
    } else {
      this.coursesService.createCourse(payload).subscribe({
        next: () => {
          this.courses.update((list) => [...list, payload]);
          this.saving.set(false);
          this.showModal.set(false);
        },
        error: () => {
          this.formError.set('ADMIN.ERROR_SAVE');
          this.saving.set(false);
        },
      });
    }
  }

  confirmDelete(code: string): void {
    this.confirmationService.confirm({
      message: this.translate.instant('ADMIN.DELETE_CONFIRM_COURSE_MSG'),
      header:  this.translate.instant('ADMIN.DELETE_CONFIRM_HEADER'),
      icon:    'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.coursesService.deleteCourse(code).subscribe({
          next: () => this.courses.update((list) => list.filter((c) => c.code !== code)),
        });
      },
    });
  }
}
