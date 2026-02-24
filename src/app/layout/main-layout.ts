import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { NavbarComponent } from '../components/navbar/navbar';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    @if (layout.sidebarOpen()) {
      <div
        class="fixed inset-0 bg-black/40 z-20 lg:hidden"
        (click)="layout.close()"
      ></div>
    }
    <div class="flex min-h-screen bg-slate-100 items-start">
      <app-sidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-navbar />
        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  layout = inject(LayoutService);
}
