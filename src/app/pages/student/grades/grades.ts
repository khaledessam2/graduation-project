import { Component, inject, computed, signal, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GradesService } from '../../../services/student/grades.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-grades',
  imports: [TranslateModule, PaginationComponent, FormsModule, Select],
  templateUrl: './grades.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GradesComponent implements OnInit {
  gradesService = inject(GradesService);
  private translate = inject(TranslateService);
  grades = this.gradesService.grades;

  filterLevel = signal<number | null>(null);
  filterTerm = signal<number | null>(null);
  availableLevels = computed(() => [
    { label: this.translate.instant('GRADES.FILTER_ALL_LEVELS'), value: null },
    ...[1, 2, 3, 4].map(v => ({ label: `${this.translate.instant('GRADES.LEVEL')} ${v}`, value: v })),
  ]);

  availableTerms = computed(() => [
    { label: this.translate.instant('GRADES.FILTER_ALL_TERMS'), value: null },
    ...[1, 2].map(v => ({ label: `${this.translate.instant('GRADES.Term')} ${v}`, value: v })),
  ]);

  filteredGrades = computed(() => this.grades());

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedGrades = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredGrades().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.gradesService.loadGrades().subscribe(() => {
      const firstGrade = this.gradesService.grades()[0];
      if (firstGrade?.level != null) {
        this.filterLevel.set(firstGrade.level);
        this.filterTerm.set(firstGrade.term ?? null);
        this.gradesService.loadGrades(firstGrade.level, firstGrade.term ?? undefined).subscribe();
      }
    });
  }

  onLevelChange(value: number | null): void {
    this.filterLevel.set(value);
    this.currentPage.set(1);
    this.gradesService.loadGrades(value ?? undefined, this.filterTerm() ?? undefined).subscribe();
  }

  onTermChange(value: number | null): void {
    this.filterTerm.set(value);
    this.currentPage.set(1);
    this.gradesService.loadGrades(this.filterLevel() ?? undefined, value ?? undefined).subscribe();
  }

  clearFilters(): void {
    this.filterLevel.set(null);
    this.filterTerm.set(null);
    this.currentPage.set(1);
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
