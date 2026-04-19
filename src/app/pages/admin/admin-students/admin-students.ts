import { Component, signal, computed, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { AdminStudentFormComponent } from './admin-student-form/admin-student-form.component';
import { AdminStudentsService } from '../../../services/admin/admin-students.service';
import { AdminStudentDto } from '../../../models/admin/admin-student.model';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

const EMPTY_FORM = (): AdminStudentDto => ({
  studentId: '', name: '', email: '', department: '', year: 'الأولى', gpa: 0, passedHours: 0, registeredCourses: [],
});

@Component({
  selector: 'app-admin-students',
  imports: [FormsModule, TranslateModule, DecimalPipe, PaginationComponent, AdminStudentFormComponent, ConfirmDialog],
  templateUrl: './admin-students.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminStudentsComponent implements OnInit {
  private studentsService     = inject(AdminStudentsService);
  private confirmationService = inject(ConfirmationService);
  private translate           = inject(TranslateService);

  searchQuery    = signal('');
  showModal      = signal(false);
  editMode       = signal(false);
  editOriginalId = signal('');
  formError      = signal('');
  form           = signal(EMPTY_FORM());
  loading        = signal(false);
  saving         = signal(false);

  coursesPopup = signal<{ name: string; courses: string[] } | null>(null);

  openCoursesPopup(student: AdminStudentDto): void {
    this.coursesPopup.set({ name: student.name, courses: student.registeredCourses });
  }

  closeCoursesPopup(): void {
    this.coursesPopup.set(null);
  }

  yearOptions = [
    { value: 'الأولى',  labelKey: 'ADMIN.YEAR_1' },
    { value: 'الثانية', labelKey: 'ADMIN.YEAR_2' },
    { value: 'الثالثة', labelKey: 'ADMIN.YEAR_3' },
    { value: 'الرابعة', labelKey: 'ADMIN.YEAR_4' },
  ];

  students = signal<AdminStudentDto[]>([]);

  filteredStudents = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.students();
    return this.students().filter(
      (s) => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q)
    );
  });

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredStudents().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.loadStudents();
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

  onSearch(value: string): void { this.searchQuery.set(value); this.currentPage.set(1); }

  onFormChange(ev: { key: string; value: any }): void {
    this.updateField(ev.key as any, ev.value);
  }

  openAddModal(): void {
    this.form.set(EMPTY_FORM());
    this.formError.set('');
    this.editMode.set(false);
    this.editOriginalId.set('');
    this.showModal.set(true);
  }

  openEditModal(student: AdminStudentDto): void {
    this.form.set({ ...student });
    this.formError.set('');
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
      this.formError.set('ADMIN.FILL_REQUIRED');
      return;
    }
    const duplicate = this.students().some(
      (s) => s.studentId === f.studentId.trim() && s.studentId !== this.editOriginalId()
    );
    if (duplicate) { this.formError.set('ADMIN.STUDENT_ID_EXISTS'); return; }

    const payload: AdminStudentDto = {
      ...f,
      studentId:   f.studentId.trim(),
      name:        f.name.trim(),
      department:  f.department.trim(),
      gpa:         Number(f.gpa),
      passedHours: Number(f.passedHours),
    };

    this.saving.set(true);
    this.formError.set('');

    if (this.editMode()) {
      this.studentsService.updateStudent(this.editOriginalId(), payload).subscribe({
        next: () => {
          this.students.update((list) =>
            list.map((s) => s.studentId === this.editOriginalId() ? payload : s)
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
      this.studentsService.createStudent(payload).subscribe({
        next: () => {
          this.students.update((list) => [...list, payload]);
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

  confirmDelete(id: string): void {
    this.confirmationService.confirm({
      message: this.translate.instant('ADMIN.DELETE_CONFIRM_MSG'),
      header:  this.translate.instant('ADMIN.DELETE_CONFIRM_HEADER'),
      icon:    'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.studentsService.deleteStudent(id).subscribe({
          next: () => this.students.update((list) => list.filter((s) => s.studentId !== id)),
        });
      },
    });
  }
}
