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

export interface Course {
  id: number;
  code: string;
  name: string;
  creditHours: number;
  prerequisites: string;
  status: 'Available' | 'Full' | 'Closed';
  professor: string;
}

export interface RegisteredCourse {
  id: number;
  code: string;
  name: string;
  hours: number;
  professor: string;
}

export interface Grade {
  id: number;
  courseName: string;
  semester: string;
  grade: number;
  recognition: string;
}

export interface LoginRequest {
  role: string;
  nationalId: string;
  password: string;
}
