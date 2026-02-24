import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login';
import { MainLayoutComponent } from './layout/main-layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { RegisterCoursesComponent } from './pages/register-courses/register-courses';
import { GradesComponent } from './pages/grades/grades';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'register-courses', component: RegisterCoursesComponent },
      { path: 'grades', component: GradesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
