import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RegistrationService } from './registration.service';
import { AuthService } from '../auth.service';
import { Course } from '../../models/student/course.model';

const API_URL = 'https://unismart-backend-one.vercel.app';

const mockCourse = (overrides: Partial<Course> = {}): Course => ({
  id: 1,
  code: 'CS101',
  name: 'Intro to CS',
  creditHours: 3,
  level: 1,
  term: 1,
  department: 'CS',
  capacity: 30,
  prerequisites: [],
  status: 'Available',
  professor: 'Dr. Smith',
  isLocked: false,
  lockReason: null,
  ...overrides,
});

describe('RegistrationService', () => {
  let service: RegistrationService;
  let httpMock: HttpTestingController;
  let authServiceMock: { getUniversityId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = { getUniversityId: vi.fn().mockReturnValue('20210001') };

    TestBed.configureTestingModule({
      providers: [
        RegistrationService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(RegistrationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('initial state', () => {
    it('should start with empty availableCourses', () => {
      expect(service.availableCourses()).toEqual([]);
    });

    it('should start with empty pendingCourseIds', () => {
      expect(service.pendingCourseIds()).toEqual([]);
    });

    it('should start with loading false and null error', () => {
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
    });
  });

  describe('loadAvailableCourses', () => {
    it('should POST to /api/courses/available with universityId', () => {
      service.loadAvailableCourses().subscribe();
      const req = httpMock.expectOne(`${API_URL}/api/courses/available`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ universityId: '20210001' });
      req.flush([]);
    });

    it('should include level and term when provided', () => {
      service.loadAvailableCourses(3, 2).subscribe();
      const req = httpMock.expectOne(`${API_URL}/api/courses/available`);
      expect(req.request.body).toEqual({ universityId: '20210001', level: 3, term: 2 });
      req.flush([]);
    });

    it('should map camelCase fields from res.data array', () => {
      service.loadAvailableCourses().subscribe();
      httpMock.expectOne(`${API_URL}/api/courses/available`).flush({
        data: [
          { code: 'CS101', name: 'Intro CS', credits: 3, level: 1, term: 1, department: 'CS', capacity: 30, status: 'Available', professor: 'Dr. A', isLocked: false, lockReason: null, prerequisites: [] },
        ],
      });

      expect(service.availableCourses()).toHaveLength(1);
      const course = service.availableCourses()[0];
      expect(course.code).toBe('CS101');
      expect(course.creditHours).toBe(3);
      expect(course.isLocked).toBe(false);
    });

    it('should map snake_case fields', () => {
      service.loadAvailableCourses().subscribe();
      httpMock.expectOne(`${API_URL}/api/courses/available`).flush([
        { course_code: 'MATH201', course_name: 'Calculus', credit_hours: 4, dept: 'Math' },
      ]);

      const course = service.availableCourses()[0];
      expect(course.code).toBe('MATH201');
      expect(course.name).toBe('Calculus');
      expect(course.creditHours).toBe(4);
      expect(course.department).toBe('Math');
    });

    it('should split string prerequisites by comma', () => {
      service.loadAvailableCourses().subscribe();
      httpMock.expectOne(`${API_URL}/api/courses/available`).flush([
        { code: 'CS301', prerequisites: 'CS101, CS201' },
      ]);

      expect(service.availableCourses()[0].prerequisites).toEqual(['CS101', 'CS201']);
    });

    it('should handle array prerequisites as-is', () => {
      service.loadAvailableCourses().subscribe();
      httpMock.expectOne(`${API_URL}/api/courses/available`).flush([
        { code: 'CS301', prerequisites: ['CS101', 'CS201'] },
      ]);

      expect(service.availableCourses()[0].prerequisites).toEqual(['CS101', 'CS201']);
    });

    it('should default creditHours to 3 when not provided', () => {
      service.loadAvailableCourses().subscribe();
      httpMock.expectOne(`${API_URL}/api/courses/available`).flush([{ code: 'CS101' }]);

      expect(service.availableCourses()[0].creditHours).toBe(3);
    });

    it('should set error on HTTP failure', () => {
      service.loadAvailableCourses().subscribe();
      httpMock.expectOne(`${API_URL}/api/courses/available`).flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Error' },
      );

      expect(service.error()).toBe('Server error');
      expect(service.loading()).toBe(false);
    });

    it('should set default error message when none in response', () => {
      service.loadAvailableCourses().subscribe();
      httpMock.expectOne(`${API_URL}/api/courses/available`).flush(null, { status: 500, statusText: 'Error' });

      expect(service.error()).toBe('Failed to load courses');
    });
  });

  describe('registerCourse', () => {
    it('should return { success: false } immediately when courseId not found', () => {
      let result: any;
      service.registerCourse(999).subscribe((r) => (result = r));
      expect(result).toEqual({ success: false });
    });

    it('should POST to /api/register-course with course code', () => {
      service.availableCourses.set([mockCourse()]);

      service.registerCourse(1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/api/register-course`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ universityId: '20210001', requestedCourses: ['CS101'] });
      req.flush({ success: true });
    });

    it('should add courseId to pendingCourseIds after successful registration', () => {
      service.availableCourses.set([mockCourse()]);

      service.registerCourse(1).subscribe();
      httpMock.expectOne(`${API_URL}/api/register-course`).flush({ success: true });

      expect(service.pendingCourseIds()).toContain(1);
    });

    it('should not duplicate courseId when registering the same course twice', () => {
      service.availableCourses.set([mockCourse()]);

      service.registerCourse(1).subscribe();
      httpMock.expectOne(`${API_URL}/api/register-course`).flush({});

      service.registerCourse(1).subscribe();
      httpMock.expectOne(`${API_URL}/api/register-course`).flush({});

      expect(service.pendingCourseIds().filter((id) => id === 1)).toHaveLength(1);
    });

    it('should set error and return { success: false } on HTTP failure', () => {
      service.availableCourses.set([mockCourse()]);

      let result: any;
      service.registerCourse(1).subscribe((r) => (result = r));
      httpMock.expectOne(`${API_URL}/api/register-course`).flush(
        { message: 'Course is full' },
        { status: 400, statusText: 'Bad Request' },
      );

      expect(service.error()).toBe('Course is full');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Course is full');
    });
  });

  describe('unregisterCourse', () => {
    it('should remove the given courseId from pendingCourseIds', () => {
      service.pendingCourseIds.set([1, 2, 3]);
      service.unregisterCourse(2);
      expect(service.pendingCourseIds()).toEqual([1, 3]);
    });

    it('should be a no-op when courseId is not in the list', () => {
      service.pendingCourseIds.set([1, 3]);
      service.unregisterCourse(99);
      expect(service.pendingCourseIds()).toEqual([1, 3]);
    });

    it('should leave empty array unchanged', () => {
      service.unregisterCourse(1);
      expect(service.pendingCourseIds()).toEqual([]);
    });
  });

  describe('pendingHours', () => {
    it('should return total credit hours of all pending courses', () => {
      service.availableCourses.set([
        mockCourse({ id: 1, creditHours: 3 }),
        mockCourse({ id: 2, code: 'CS102', creditHours: 4 }),
      ]);
      service.pendingCourseIds.set([1, 2]);

      expect(service.pendingHours).toBe(7);
    });

    it('should return 0 when no pending courses', () => {
      expect(service.pendingHours).toBe(0);
    });

    it('should skip courses not found in availableCourses', () => {
      service.availableCourses.set([mockCourse({ id: 1, creditHours: 3 })]);
      service.pendingCourseIds.set([1, 999]);

      expect(service.pendingHours).toBe(3);
    });
  });
});
