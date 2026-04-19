import { Student } from './student/student.model';

export interface LoginRequest {
  university_id: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  user?: Partial<Student>;
  message?: string;
  success?: boolean;
  university_id?: string;
}
