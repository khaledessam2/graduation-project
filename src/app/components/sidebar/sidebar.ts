import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarComponent {
  auth = inject(AuthService);
  layout = inject(LayoutService);

  navItems = [
    { labelKey: 'SIDEBAR.DASHBOARD',        icon: 'home',          route: '/dashboard' },
    { labelKey: 'SIDEBAR.REGISTER_COURSES', icon: 'person-add',    route: '/register-courses' },
    { labelKey: 'SIDEBAR.GRADES',           icon: 'bar-chart',     route: '/grades' },
    { labelKey: 'SIDEBAR.PROFILE',          icon: 'person-circle', route: '/profile' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
