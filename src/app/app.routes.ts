import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { LoginComponent } from './pages/login/login';
import { MainLayoutComponent } from './layout/main-layout';
import { DashboardComponent } from './pages/student/dashboard/dashboard';
import { RegisterCoursesComponent } from './pages/student/register-courses/register-courses';
import { GradesComponent } from './pages/student/grades/grades';
import { ProfileComponent } from './pages/student/profile/profile';
import { TimetableComponent } from './pages/student/timetable/timetable';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard';
import { AdminStudentsComponent } from './pages/admin/admin-students/admin-students';
import { AdminCoursesComponent } from './pages/admin/admin-courses/admin-courses';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent},
      { path: 'register-courses', component: RegisterCoursesComponent },
      { path: 'grades', component: GradesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'timetable', component: TimetableComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'students', component: AdminStudentsComponent  },
      { path: 'courses', component: AdminCoursesComponent   },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
