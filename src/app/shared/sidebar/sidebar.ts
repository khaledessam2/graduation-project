import { Component, inject, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

  navItems = computed(() => {
    if (this.auth.currentUser()?.role === 'admin') {
      return [
        { labelKey: 'SIDEBAR.ADMIN_DASHBOARD', icon: 'home',    route: '/admin/dashboard' },
        { labelKey: 'SIDEBAR.ADMIN_STUDENTS',  icon: 'people',  route: '/admin/students'  },
        { labelKey: 'SIDEBAR.ADMIN_COURSES',   icon: 'library', route: '/admin/courses'   },
      ];
    }
    return [
      { labelKey: 'SIDEBAR.DASHBOARD',        icon: 'home',          route: '/dashboard'        },
      { labelKey: 'SIDEBAR.REGISTER_COURSES', icon: 'person-add',    route: '/register-courses' },
      { labelKey: 'SIDEBAR.TIMETABLE',        icon: 'calendar',      route: '/timetable'        },
      { labelKey: 'SIDEBAR.GRADES',           icon: 'bar-chart',     route: '/grades'           },
      { labelKey: 'SIDEBAR.PROFILE',          icon: 'person-circle', route: '/profile'          },
    ];
  });

  logout(): void {
    this.auth.logout();
  }
}
