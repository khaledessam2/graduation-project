import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './services/language.service';
import { LoadingBarComponent } from './shared/loading-bar/loading-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingBarComponent],
  template: `
    <app-loading-bar />
    <router-outlet />
  `,
})
export class App {
  // Inject to initialize lang + RTL on startup
  langService = inject(LanguageService);
}
