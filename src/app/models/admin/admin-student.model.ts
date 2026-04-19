export interface AdminStudentDto {
  studentId: string;
  name: string;
  email: string;
  department: string;
  year: string;
  gpa: number;
  passedHours: number;
  registeredCourses: string[];
}
