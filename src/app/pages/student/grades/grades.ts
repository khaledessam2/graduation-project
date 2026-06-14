import { Component, inject, computed, signal, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GradesService } from '../../../services/student/grades.service';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grades',
  imports: [TranslateModule, PaginationComponent, FormsModule],
  templateUrl: './grades.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GradesComponent implements OnInit {
  gradesService = inject(GradesService);
  grades = this.gradesService.grades;

  searchQuery = signal('');

  filteredGrades = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.grades();
    return this.grades().filter(g =>
      g.courseName.toLowerCase().includes(q) ||
      g.semester?.toLowerCase().includes(q)
    );
  });

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedGrades = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredGrades().slice(start, start + this.pageSize);
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
