import { Component, input, output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminStudentDto } from '../../../../models/admin/admin-student.model';

@Component({
  selector: 'app-admin-student-form',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-student-form.component.html',
})
export class AdminStudentFormComponent {
  form        = input.required<AdminStudentDto>();
  editMode    = input.required<boolean>();
  formError   = input<string>('');
  saving      = input<boolean>(false);
  yearOptions = input.required<{ value: string; labelKey: string }[]>();

  fieldChange = output<{ key: string; value: any }>();
  save        = output<void>();
  cancel      = output<void>();

  update(key: string, value: any): void {
    this.fieldChange.emit({ key, value });
  }
}
