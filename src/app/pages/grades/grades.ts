import { Component, inject } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-grades',
  imports: [TranslateModule],
  templateUrl: './grades.html',
})
export class GradesComponent {
  courseService = inject(CourseService);
  grades = this.courseService.grades;

  getGradeClass(recognition: string): string {
    if (['A+', 'A', 'A-'].includes(recognition)) return 'bg-green-100 text-green-800';
    if (['B+', 'B', 'B-'].includes(recognition)) return 'bg-emerald-100 text-emerald-800';
    if (['C+', 'C', 'C-'].includes(recognition)) return 'bg-orange-100 text-orange-800';
    if (recognition === 'F') return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-600';
  }
}
