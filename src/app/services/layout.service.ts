import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  sidebarOpen = signal(false);
  sidebarCollapsed = signal(false);

  toggle(): void {
    this.sidebarOpen.update((v) => !v);
  }

  close(): void {
    this.sidebarOpen.set(false);
  }

  toggleCollapse(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
}
