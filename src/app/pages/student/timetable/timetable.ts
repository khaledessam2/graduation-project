import { Component, inject, computed, signal, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TimetableService } from '../../../services/student/timetable.service';
import { AuthService } from '../../../services/auth.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-timetable',
  imports: [TranslateModule, PaginationComponent],
  templateUrl: './timetable.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimetableComponent implements OnInit {
  timetableService = inject(TimetableService);
  auth = inject(AuthService);

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedEntries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.timetableService.entries().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.timetableService.loadTimetable().subscribe();
  }

  getTimeParts(time: string): { start: string; end: string } | null {
    const parts = time.split(' - ');
    return parts.length === 2 ? { start: parts[0].trim(), end: parts[1].trim() } : null;
  }
}
