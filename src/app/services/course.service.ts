import { Injectable, signal } from '@angular/core';
import { Course, RegisteredCourse, Grade } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CourseService {
  // Mock data — replace with real API later

  availableCourses = signal<Course[]>([
    { id: 1, code: 'CS201', name: 'Data Structures', creditHours: 3, prerequisites: 'CS301', status: 'Available', professor: 'Dr.Osama' },
    { id: 2, code: 'CS202', name: 'Algorithms', creditHours: 3, prerequisites: 'CS201', status: 'Available', professor: 'Dr.Ahmed' },
    { id: 3, code: 'CS203', name: 'Database Systems', creditHours: 3, prerequisites: 'CS202', status: 'Available', professor: 'Dr.Sara' },
    { id: 4, code: 'CS204', name: 'Operating Systems', creditHours: 3, prerequisites: 'CS203', status: 'Available', professor: 'Dr.Mona' },
    { id: 5, code: 'CS205', name: 'Computer Networks', creditHours: 3, prerequisites: 'CS204', status: 'Available', professor: 'Dr.Khaled' },
    { id: 6, code: 'CS206', name: 'Software Engineering', creditHours: 3, prerequisites: 'CS205', status: 'Available', professor: 'Dr.Fatima' },
  ]);

  registeredCourses = signal<RegisteredCourse[]>([
    { id: 1, code: 'CS105', name: 'Algorithms', hours: 3, professor: 'Dr.Osama' },
    { id: 2, code: 'CS105', name: 'Algorithms', hours: 3, professor: 'Dr.Osama' },
    { id: 3, code: 'CS105', name: 'Algorithms', hours: 3, professor: 'Dr.Osama' },
    { id: 4, code: 'CS105', name: 'Algorithms', hours: 3, professor: 'Dr.Osama' },
    { id: 5, code: 'CS105', name: 'Algorithms', hours: 3, professor: 'Dr.Osama' },
    { id: 6, code: 'CS106', name: 'Algorithms', hours: 3, professor: 'Dr.Osama' },
  ]);

  grades = signal<Grade[]>([
    { id: 1, courseName: 'Data Structures', semester: 'First 2024', grade: 97, recognition: 'A+' },
    { id: 2, courseName: 'Data Structures', semester: 'First 2024', grade: 88, recognition: 'B+' },
    { id: 3, courseName: 'Data Structures', semester: 'First 2024', grade: 0,  recognition: 'F' },
    { id: 4, courseName: 'Data Structures', semester: 'First 2024', grade: 92, recognition: 'A' },
  ]);

  // Track pending registration for the register page
  pendingCourseIds = signal<number[]>([]);

  registerCourse(courseId: number): void {
    const current = this.pendingCourseIds();
    if (!current.includes(courseId)) {
      this.pendingCourseIds.set([...current, courseId]);
    }
  }

  unregisterCourse(courseId: number): void {
    this.pendingCourseIds.set(this.pendingCourseIds().filter((id) => id !== courseId));
  }

  confirmRegistration(): void {
    const courses = this.availableCourses();
    const pending = this.pendingCourseIds();
    const newRegistered: RegisteredCourse[] = pending.map((id) => {
      const c = courses.find((x) => x.id === id)!;
      return { id: c.id, code: c.code, name: c.name, hours: c.creditHours, professor: c.professor };
    });
    this.registeredCourses.set([...this.registeredCourses(), ...newRegistered]);
    this.pendingCourseIds.set([]);
  }

  deleteCourse(id: number): void {
    this.registeredCourses.set(this.registeredCourses().filter((c) => c.id !== id));
  }

  get totalRegisteredHours(): number {
    return this.registeredCourses().reduce((sum, c) => sum + c.hours, 0);
  }

  get pendingHours(): number {
    const courses = this.availableCourses();
    return this.pendingCourseIds().reduce((sum, id) => {
      const c = courses.find((x) => x.id === id);
      return sum + (c ? c.creditHours : 0);
    }, 0);
  }
}
