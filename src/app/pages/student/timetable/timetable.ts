import { Component, inject, computed, signal, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TimetableService } from '../../../services/student/timetable.service';
import { AuthService } from '../../../services/auth.service';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timetable',
  imports: [TranslateModule, PaginationComponent, FormsModule],
  templateUrl: './timetable.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimetableComponent implements OnInit {
  timetableService = inject(TimetableService);
  auth = inject(AuthService);

  isGraduated = computed(() => this.auth.currentUser()?.status === 'GRADUATED');

  searchQuery = signal('');

  filteredEntries = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.timetableService.entries();
    return this.timetableService.entries().filter(e =>
      e.courseCode?.toLowerCase().includes(q) ||
      e.courseName?.toLowerCase().includes(q) ||
      e.day?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q)
    );
  });

  readonly pageSize = 10;
  currentPage = signal(1);
  paginatedEntries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredEntries().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.timetableService.loadTimetable().subscribe();
  }

  getTimeParts(time: string): { start: string; end: string } | null {
    const parts = time.split(' - ');
    return parts.length === 2 ? { start: parts[0].trim(), end: parts[1].trim() } : null;
  }
}
