export interface Student {
  id: number;
  name: string;
  nationalId: string;
  email: string;
  yearOfStudy: string;
  department: string;
  studentId: string;
  gpa: number;
  passedHours: number;
  availableHours: number;
  role: 'student' | 'admin';
}
