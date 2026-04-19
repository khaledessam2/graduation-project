import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { GradesService } from '../../../services/student/grades.service';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-grades',
  imports: [TranslateModule, PaginationComponent],
  templateUrl: './grades.html',
})
export class GradesComponent implements OnInit {
  gradesService = inject(GradesService);
  grades = this.gradesService.grades;

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedGrades = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.grades().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.gradesService.loadGrades().subscribe();
  }

  getGradeClass(recognition: string): string {
    if (['A+', 'A', 'A-'].includes(recognition)) return 'bg-green-100 text-green-800';
    if (['B+', 'B', 'B-'].includes(recognition)) return 'bg-emerald-100 text-emerald-800';
    if (['C+', 'C', 'C-'].includes(recognition)) return 'bg-orange-100 text-orange-800';
    if (recognition === 'F') return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-600';
  }
}
