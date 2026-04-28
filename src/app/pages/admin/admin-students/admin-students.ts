import { Component, signal, computed, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { AdminStudentFormComponent } from './admin-student-form/admin-student-form.component';
import { AdminStudentsService } from '../../../services/admin/admin-students.service';
import { AdminCoursesService } from '../../../services/admin/admin-courses.service';
import { AdminStudentDto, AcademicRecord } from '../../../models/admin/admin-student.model';
import { AdminCourseDto } from '../../../models/admin/admin-course.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Select } from 'primeng/select';

const EMPTY_FORM = (): AdminStudentDto => ({
  studentId: '',
  name: '',
  email: '',
  department: '',
  year: '',
  gpa: 0,
  passedHours: 0,
  registeredCourses: [],
  academicHistory: [],
  password: '',
});

@Component({
  selector: 'app-admin-students',
  imports: [
    FormsModule,
    TranslateModule,
    DecimalPipe,
    PaginationComponent,
    AdminStudentFormComponent,
    ConfirmDialog,
    Select,
  ],
  templateUrl: './admin-students.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminStudentsComponent implements OnInit {
  private studentsService = inject(AdminStudentsService);
  private coursesService = inject(AdminCoursesService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);
  private toast = inject(MessageService);

  searchQuery = signal('');
  filterDepartment = signal<string | null>(null);
  filterYear = signal<string | null>(null);
  filterGpa = signal<string | null>(null);
  showModal = signal(false);
  editMode = signal(false);
  editOriginalId = signal('');

  form = signal(EMPTY_FORM());
  loading = signal(false);
  saving = signal(false);

  coursesPopup = signal<{
    name: string;
    courses: { code: string; name: string }[];
    academicHistory: AcademicRecord[];
  } | null>(null);

  openCoursesPopup(student: AdminStudentDto): void {
    this.coursesPopup.set({
      name: student.name,
      courses: student.registeredCourses.map(c => ({ code: c.code, name: c.name })),
      academicHistory: student.academicHistory,
    });
  }

  closeCoursesPopup(): void {
    this.coursesPopup.set(null);
  }

  yearOptions = [
    { value: 'الأولى', labelKey: 'ADMIN.YEAR_1', label: 'الأولى' },
    { value: 'الثانية', labelKey: 'ADMIN.YEAR_2', label: 'الثانية' },
    { value: 'الثالثة', labelKey: 'ADMIN.YEAR_3', label: 'الثالثة' },
    { value: 'الرابعة', labelKey: 'ADMIN.YEAR_4', label: 'الرابعة' },
  ];

  students = signal<AdminStudentDto[]>([]);
  availableCourses = signal<AdminCourseDto[]>([]);

  availableDepartments = computed(() =>
    [...new Set(this.students().map(s => s.department).filter(Boolean))].sort()
      .map(v => ({ label: v, value: v }))
  );

  gpaOptions = [
    { label: '≥ 3.5', value: 'high' },
    { label: '3.0 – 3.49', value: 'mid' },
    { label: '< 3.0', value: 'low' },
  ];

  hasActiveFilter = computed(() =>
    this.filterDepartment() !== null || this.filterYear() !== null || this.filterGpa() !== null
  );

  filteredStudents = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const dept = this.filterDepartment();
    const year = this.filterYear();
    const gpa = this.filterGpa();
    return this.students().filter(s => {
      if (q && !s.name.toLowerCase().includes(q) && !s.studentId.toLowerCase().includes(q)) return false;
      if (dept && s.department !== dept) return false;
      if (year && s.year !== year) return false;
      if (gpa === 'high' && s.gpa < 3.5) return false;
      if (gpa === 'mid' && (s.gpa < 3.0 || s.gpa >= 3.5)) return false;
      if (gpa === 'low' && s.gpa >= 3.0) return false;
      return true;
    });
  });

  clearFilters(): void {
    this.filterDepartment.set(null);
    this.filterYear.set(null);
    this.filterGpa.set(null);
    this.currentPage.set(1);
  }

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredStudents().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.loadStudents();
    this.loadCourses();
  }

  private loadCourses(): void {
    this.coursesService.getCourses().subscribe({
      next: (list) => this.availableCourses.set(list),
    });
  }

  private loadStudents(): void {
    this.loading.set(true);
    this.studentsService.getStudents().subscribe({
      next: (list) => {
        this.students.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onFormChange(ev: { key: string; value: any }): void {
    this.updateField(ev.key as any, ev.value);
  }

  openAddModal(): void {
    this.form.set(EMPTY_FORM());
    this.editMode.set(false);
    this.editOriginalId.set('');
    this.showModal.set(true);
  }

  openEditModal(student: AdminStudentDto): void {
    this.form.set({ ...student });
    this.editMode.set(true);
    this.editOriginalId.set(student.studentId);
    this.showModal.set(true);
  }

  closeModal(): void {
    if (!this.saving()) this.showModal.set(false);
  }

  updateField<K extends keyof AdminStudentDto>(key: K, value: AdminStudentDto[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  submitForm(): void {
    const f = this.form();
    if (!f.studentId.trim() || !f.name.trim() || !f.department.trim()) {
      this.toast.add({ severity: 'warn', summary: this.translate.instant('ADMIN.VALIDATION_ERROR'), detail: this.translate.instant('ADMIN.FILL_REQUIRED'), life: 4000 });
      return;
    }
    const duplicate = this.students().some(
      (s) => s.studentId === f.studentId.trim() && s.studentId !== this.editOriginalId(),
    );
    if (duplicate) {
      this.toast.add({ severity: 'warn', summary: this.translate.instant('ADMIN.VALIDATION_ERROR'), detail: this.translate.instant('ADMIN.STUDENT_ID_EXISTS'), life: 4000 });
      return;
    }

    const payload: AdminStudentDto = {
      ...f,
      studentId: f.studentId.trim(),
      name: f.name.trim(),
      department: f.department.trim(),
      gpa: Number(f.gpa),
      passedHours: Number(f.passedHours),
    };

    if (this.editMode() && !f.password?.trim()) {
      delete (payload as any).password;
    }

    this.saving.set(true);

    if (this.editMode()) {
      this.studentsService.updateStudent(this.editOriginalId(), payload).subscribe({
        next: () => {
          this.students.update((list) =>
            list.map((s) => (s.studentId === this.editOriginalId() ? payload : s)),
          );
          this.saving.set(false);
          this.showModal.set(false);
        },
        error: (err) => {
          const msg = err?.error?.message ?? this.translate.instant('ADMIN.ERROR_SAVE');
          this.toast.add({ severity: 'error', summary: this.translate.instant('ADMIN.ERROR'), detail: msg, life: 5000 });
          this.saving.set(false);
        },
      });
    } else {
      this.studentsService.createStudent(payload).subscribe({
        next: () => {
          this.students.update((list) => [...list, payload]);
          this.saving.set(false);
          this.showModal.set(false);
        },
        error: (err) => {
          const msg = err?.error?.message ?? this.translate.instant('ADMIN.ERROR_SAVE');
          this.toast.add({ severity: 'error', summary: this.translate.instant('ADMIN.ERROR'), detail: msg, life: 5000 });
          this.saving.set(false);
        },
      });
    }
  }

  confirmDelete(id: string): void {
    this.confirmationService.confirm({
      message: this.translate.instant('ADMIN.DELETE_CONFIRM_MSG'),
      header: this.translate.instant('ADMIN.DELETE_CONFIRM_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.studentsService.deleteStudent(id).subscribe({
          next: () => this.students.update((list) => list.filter((s) => s.studentId !== id)),
        });
      },
    });
  }
}
