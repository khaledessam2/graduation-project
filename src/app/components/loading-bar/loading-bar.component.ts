import { Component, inject, signal, effect } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

type BarState = 'idle' | 'loading' | 'completing';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  template: `
    @if (state() !== 'idle') {
      <div class="loading-bar" [class.completing]="state() === 'completing'"></div>
    }
  `,
  styles: [`
    .loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 99999;
      background: linear-gradient(90deg, #075392, #3d6ea8, #075392);
      transform: translateX(-100%);
      animation: indeterminate 3s ease-out forwards;
      box-shadow: 0 0 10px rgba(7, 83, 146, 0.7), 0 0 4px rgba(61, 110, 168, 0.5);
    }

    .loading-bar.completing {
      animation: complete 0.45s ease-out forwards;
    }

    @keyframes indeterminate {
      0%   { transform: translateX(-100%); }
      15%  { transform: translateX(-70%); }
      40%  { transform: translateX(-45%); }
      65%  { transform: translateX(-25%); }
      100% { transform: translateX(-15%); }
    }

    @keyframes complete {
      0%   { transform: translateX(-15%); opacity: 1; }
      55%  { transform: translateX(0%);   opacity: 1; }
      100% { transform: translateX(0%);   opacity: 0; }
    }
  `],
})
export class LoadingBarComponent {
  private loadingService = inject(LoadingService);
  state = signal<BarState>('idle');

  private completeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const loading = this.loadingService.isLoading();

      if (loading) {
        if (this.completeTimer) {
          clearTimeout(this.completeTimer);
          this.completeTimer = null;
        }
        this.state.set('loading');
      } else if (this.state() === 'loading') {
        this.state.set('completing');
        this.completeTimer = setTimeout(() => {
          this.state.set('idle');
          this.completeTimer = null;
        }, 500);
      }
    });
  }
}
