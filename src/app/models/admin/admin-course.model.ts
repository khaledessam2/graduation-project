export interface AdminCourseDto {
  code: string;
  name: string;
  creditHours: number;
  level: number;
  professor: string;
  status: 'Available' | 'Full' | 'Closed';
  prerequisites: string;
  enrolled: number;
  capacity: number;
}
