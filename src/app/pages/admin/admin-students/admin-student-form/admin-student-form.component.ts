import { Component, input, output, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminStudentDto, AcademicRecord } from '../../../../models/admin/admin-student.model';

@Component({
  selector: 'app-admin-student-form',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-student-form.component.html',
})
export class AdminStudentFormComponent {
  form = input.required<AdminStudentDto>();
  editMode = input.required<boolean>();
  formError = input<string>('');
  saving = input<boolean>(false);
  yearOptions = input.required<{ value: string; labelKey: string }[]>();

  fieldChange = output<{ key: string; value: any }>();
  save = output<void>();
  cancel = output<void>();

  newCourse = signal('');
  newRecord = signal<AcademicRecord>({ courseCode: '', semester: '', grade: 0, recognition: '' });
  showPassword = signal(false);

  update(key: string, value: any): void {
    this.fieldChange.emit({ key, value });
  }

  addCourse(): void {
    const code = this.newCourse().trim().toUpperCase();
    if (!code) return;
    const current = this.form().registeredCourses;
    if (current.includes(code)) return;
    this.update('registeredCourses', [...current, code]);
    this.newCourse.set('');
  }

  removeCourse(code: string): void {
    this.update(
      'registeredCourses',
      this.form().registeredCourses.filter((c) => c !== code),
    );
  }

  addRecord(): void {
    const r = this.newRecord();
    if (!r.courseCode.trim() || !r.semester.trim()) return;
    this.update('academicHistory', [
      ...this.form().academicHistory,
      { ...r, courseCode: r.courseCode.trim().toUpperCase() },
    ]);
    this.newRecord.set({ courseCode: '', semester: '', grade: 0, recognition: '' });
  }

  removeRecord(index: number): void {
    this.update(
      'academicHistory',
      this.form().academicHistory.filter((_, i) => i !== index),
    );
  }

  onCourseKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addCourse();
    }
  }
}
