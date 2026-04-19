import { Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  total       = input.required<number>();
  pageSize    = input<number>(10);
  currentPage = input.required<number>();
  pageChange  = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  from       = computed(() => this.total() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1);
  to         = computed(() => Math.min(this.total(), this.currentPage() * this.pageSize()));

  pages = computed<(number | null)[]>(() => {
    const total   = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const result: (number | null)[] = [1];
    if (current > 3) result.push(null);
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) result.push(p);
    if (current < total - 2) result.push(null);
    result.push(total);
    return result;
  });

  prev(): void  { if (this.currentPage() > 1)                this.pageChange.emit(this.currentPage() - 1); }
  next(): void  { if (this.currentPage() < this.totalPages()) this.pageChange.emit(this.currentPage() + 1); }
  goTo(p: number): void { this.pageChange.emit(p); }
}
