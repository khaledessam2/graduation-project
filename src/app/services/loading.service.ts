import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private router = inject(Router);
  private activeRequests = signal(0);

  isLoading = computed(() => this.activeRequests() > 0);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) this.start();
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
        this.stop();
    });
  }

  start() {
    this.activeRequests.update((n) => n + 1);
  }

  stop() {
    this.activeRequests.update((n) => Math.max(0, n - 1));
  }
}
