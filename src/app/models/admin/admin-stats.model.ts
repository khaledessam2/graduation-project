import { RecentRegistration } from './recent-registration.model';

export interface AdminStats {
  totalStudents: number;
  totalCourses: number;
  activeRegistrations: number;
  departmentsCount: number;
  recentRegistrations: RecentRegistration[];
}
