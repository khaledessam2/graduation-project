export interface AcademicRecord {
  courseCode: string;
  semester: string;
  grade: number;
  recognition: string;
}

export interface AdminRegisteredCourse {
  code: string;
  name: string;
  level: number;
  term: number;
  creditHours: number;
  department: string;
}

export interface AdminStudentDto {
  studentId: string;
  name: string;
  email: string;
  department: string;
  year: string;
  gpa: number;
  passedHours: number;
  status: 'REGULAR' | 'PROBATION' | 'GRADUATED';
  registeredCourses: AdminRegisteredCourse[];
  academicHistory: AcademicRecord[];
  password: string;
}
