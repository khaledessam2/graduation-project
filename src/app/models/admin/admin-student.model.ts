export interface AcademicRecord {
  courseCode: string;
  semester: string;
  grade: number;
  recognition: string;
}

export interface AdminStudentDto {
  studentId: string;
  name: string;
  email: string;
  department: string;
  year: string;
  gpa: number;
  passedHours: number;
  registeredCourses: string[];
  academicHistory: AcademicRecord[];
  password: string;
}
