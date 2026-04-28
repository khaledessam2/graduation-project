import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/student/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'register-courses',
        loadComponent: () => import('./pages/student/register-courses/register-courses').then(m => m.RegisterCoursesComponent),
      },
      {
        path: 'grades',
        loadComponent: () => import('./pages/student/grades/grades').then(m => m.GradesComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/student/profile/profile').then(m => m.ProfileComponent),
      },
      {
        path: 'timetable',
        loadComponent: () => import('./pages/student/timetable/timetable').then(m => m.TimetableComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'students',
        loadComponent: () => import('./pages/admin/admin-students/admin-students').then(m => m.AdminStudentsComponent),
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/admin/admin-courses/admin-courses').then(m => m.AdminCoursesComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
