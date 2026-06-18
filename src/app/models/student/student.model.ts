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
  status: 'REGULAR' | 'PROBATION' | 'GRADUATED';
  graduationDate?: string | null;
  degreeName?: string | null;
  honors?: string | null;
  diplomaNumber?: string | null;
}
