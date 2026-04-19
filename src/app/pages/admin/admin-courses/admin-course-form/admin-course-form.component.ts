import { Component, input, output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminCourseDto } from '../../../../models/admin/admin-course.model';

@Component({
  selector: 'app-admin-course-form',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-course-form.component.html',
})
export class AdminCourseFormComponent {
  form         = input.required<Omit<AdminCourseDto, 'enrolled'>>();
  editMode     = input.required<boolean>();
  formError    = input<string>('');
  saving       = input<boolean>(false);
  statusOptions = input.required<{ value: AdminCourseDto['status']; labelKey: string }[]>();

  fieldChange = output<{ key: string; value: any }>();
  save        = output<void>();
  cancel      = output<void>();

  update(key: string, value: any): void {
    this.fieldChange.emit({ key, value });
  }
}
