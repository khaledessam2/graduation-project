import { Component, computed, input, output, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { AdminStudentDto, AcademicRecord, AdminRegisteredCourse } from '../../../../models/admin/admin-student.model';
import { AdminCourseDto } from '../../../../models/admin/admin-course.model';

@Component({
  selector: 'app-admin-student-form',
  standalone: true,
  imports: [FormsModule, TranslateModule, Select, MultiSelect],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-student-form.component.html',
})
export class AdminStudentFormComponent {
  form = input.required<AdminStudentDto>();
  editMode = input.required<boolean>();
  saving = input<boolean>(false);
  yearOptions = input.required<{ value: string; labelKey: string; label: string }[]>();
  availableCourses = input<AdminCourseDto[]>([]);

  fieldChange = output<{ key: string; value: any }>();
  save = output<void>();
  cancel = output<void>();

  newRecord = signal<AcademicRecord>({ courseCode: '', semester: '', grade: 0, recognition: '' });
  showPassword = signal(false);

  allCourseOptions = computed(() =>
    this.availableCourses().map(c => ({
      label: `${c.code} — ${c.name}`,
      value: c.code,
    }))
  );

  selectedCourseCodes = computed(() => this.form().registeredCourses.map(c => c.code));

  courseSelectOptions = computed(() =>
    this.form().registeredCourses.map(c => ({
      label: `${c.code} — ${c.name}`,
      value: c.code,
      term: c.term,
    }))
  );

  update(key: string, value: any): void {
    this.fieldChange.emit({ key, value });
  }

  onRegisteredCoursesChange(codes: string[]): void {
    const courseMap = new Map(this.availableCourses().map(c => [c.code, c]));
    const newCourses: AdminRegisteredCourse[] = codes.map(code => {
      const full = courseMap.get(code);
      return full
        ? { code: full.code, name: full.name, level: full.level, term: full.term, creditHours: full.creditHours, department: full.department }
        : { code, name: code, level: 0, term: 0, creditHours: 0, department: '' };
    });
    this.update('registeredCourses', newCourses);
  }

  onCourseSelect(code: string): void {
    const course = this.form().registeredCourses.find(c => c.code === code);
    const semester = course ? (course.term === 1 ? 'الأول' : 'الثاني') : '';
    this.newRecord.update(r => ({ ...r, courseCode: code, semester }));
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

}
