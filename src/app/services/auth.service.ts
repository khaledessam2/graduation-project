import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Student, LoginRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'unismart_user';

  currentUser = signal<Student | null>(this.loadUser());

  // Mock student data — replace with real API later
  private mockStudents: Student[] = [
    {
      id: 1,
      name: 'Ayman Mohamed Fayez Ghonim',
      nationalId: '30012345678901',
      email: 'ayman@university.edu',
      yearOfStudy: 'Fourth Year',
      department: 'Computer Science',
      studentId: '20251234',
      gpa: 3.6,
      passedHours: 30,
      availableHours: 18,
      role: 'student',
    },
  ];

  constructor(private router: Router) {}

  private loadUser(): Student | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  login(payload: LoginRequest): { success: boolean; message: string } {
    // TODO: Replace with real API call
    const student = this.mockStudents.find(
      (s) => s.nationalId === payload.nationalId
    );

    if (!student) {
      return { success: false, message: 'National ID not found.' };
    }

    // Mock password check (password = nationalId for now)
    if (payload.password !== '123456') {
      return { success: false, message: 'Incorrect password.' };
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(student));
    this.currentUser.set(student);
    return { success: true, message: 'Login successful.' };
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
