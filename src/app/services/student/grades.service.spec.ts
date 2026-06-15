import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GradesService } from './grades.service';
import { AuthService } from '../auth.service';

const API_URL = 'https://unismart-backend-one.vercel.app';

describe('GradesService', () => {
  let service: GradesService;
  let httpMock: HttpTestingController;
  let authServiceMock: { getUniversityId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = { getUniversityId: vi.fn().mockReturnValue('20210001') };

    TestBed.configureTestingModule({
      providers: [
        GradesService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(GradesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('initial state', () => {
    it('should start with empty grades', () => {
      expect(service.grades()).toEqual([]);
    });

    it('should start with loading false', () => {
      expect(service.loading()).toBe(false);
    });

    it('should start with null error', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('loadGrades', () => {
    it('should set loading to true before response arrives', () => {
      service.loadGrades().subscribe();
      expect(service.loading()).toBe(true);
      httpMock.expectOne(`${API_URL}/api/grades`).flush([]);
    });

    it('should POST to /api/grades with universityId in body', () => {
      service.loadGrades().subscribe();
      const req = httpMock.expectOne(`${API_URL}/api/grades`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ universityId: '20210001' });
      req.flush([]);
    });

    it('should include level and term in body when provided', () => {
      service.loadGrades(2, 1).subscribe();
      const req = httpMock.expectOne(`${API_URL}/api/grades`);
      expect(req.request.body).toEqual({ universityId: '20210001', level: 2, term: 1 });
      req.flush([]);
    });

    it('should not include level/term when not provided', () => {
      service.loadGrades().subscribe();
      const req = httpMock.expectOne(`${API_URL}/api/grades`);
      expect(req.request.body).not.toHaveProperty('level');
      expect(req.request.body).not.toHaveProperty('term');
      req.flush([]);
    });

    it('should map camelCase fields from res.data array', () => {
      service.loadGrades().subscribe();
      httpMock.expectOne(`${API_URL}/api/grades`).flush({
        data: [
          { courseName: 'Math 101', semester: 'Fall 2023', grade: 90, recognition: 'A', level: 1, term: 1 },
          { courseName: 'Physics', semester: 'Fall 2023', grade: 75, recognition: 'B', level: 1, term: 1 },
        ],
      });

      const grades = service.grades();
      expect(grades).toHaveLength(2);
      expect(grades[0]).toEqual({ id: 1, courseName: 'Math 101', semester: 'Fall 2023', grade: 90, recognition: 'A', level: 1, term: 1 });
      expect(grades[1].id).toBe(2);
    });

    it('should map snake_case fields from direct array response', () => {
      service.loadGrades().subscribe();
      httpMock.expectOne(`${API_URL}/api/grades`).flush([
        { course_name: 'Physics', semester: 'Spring 2024', numeric_grade: 85, letter_grade: 'B+', level: 2, term: 2 },
      ]);

      const grade = service.grades()[0];
      expect(grade.courseName).toBe('Physics');
      expect(grade.grade).toBe(85);
      expect(grade.recognition).toBe('B+');
    });

    it('should use courseCode as courseName fallback', () => {
      service.loadGrades().subscribe();
      httpMock.expectOne(`${API_URL}/api/grades`).flush([{ courseCode: 'CS101' }]);
      expect(service.grades()[0].courseName).toBe('CS101');
    });

    it('should handle null level and term fields', () => {
      service.loadGrades().subscribe();
      httpMock.expectOne(`${API_URL}/api/grades`).flush([{ courseName: 'Art' }]);

      expect(service.grades()[0].level).toBeNull();
      expect(service.grades()[0].term).toBeNull();
    });

    it('should set loading to false after success', () => {
      service.loadGrades().subscribe();
      httpMock.expectOne(`${API_URL}/api/grades`).flush([]);
      expect(service.loading()).toBe(false);
    });

    it('should set error signal on HTTP failure', () => {
      service.loadGrades().subscribe();
      httpMock.expectOne(`${API_URL}/api/grades`).flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(service.error()).toBe('Unauthorized');
      expect(service.loading()).toBe(false);
    });

    it('should set default error message when no message in error response', () => {
      service.loadGrades().subscribe();
      httpMock.expectOne(`${API_URL}/api/grades`).flush(null, { status: 500, statusText: 'Server Error' });

      expect(service.error()).toBe('Failed to load grades');
    });

    it('should clear error signal before each request', () => {
      service.error.set('previous error');
      service.loadGrades().subscribe();
      expect(service.error()).toBeNull();
      httpMock.expectOne(`${API_URL}/api/grades`).flush([]);
    });
  });
});
