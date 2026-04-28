export interface AdminCourseDto {
  code: string;
  name: string;
  creditHours: number;
  level: number;
  term: number;
  department: string;
  professor: string;
  status: 'Available' | 'Full' | 'Closed';
  prerequisites: string;
  enrolled: number;
  capacity: number;
}
