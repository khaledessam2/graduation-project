import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { LayoutService } from '../../services/layout.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, TranslateModule],
  templateUrl: './navbar.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NavbarComponent {
  langService = inject(LanguageService);
  layout = inject(LayoutService);
  dashboardService = inject(DashboardService);
  router = inject(Router);

  get isDashboard(): boolean {
    return this.router.url === '/dashboard' || this.router.url === '/';
  }
}
