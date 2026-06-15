import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminStatsService } from './admin-stats.service';
import { AdminStats } from '../../models/admin/admin-stats.model';

const API_URL = 'https://unismart-backend-one.vercel.app';

describe('AdminStatsService', () => {
  let service: AdminStatsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminStatsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdminStatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getStats', () => {
    it('should POST to /api/admin/stats with an empty body', () => {
      service.getStats().subscribe();
      const req = httpMock.expectOne(`${API_URL}/api/admin/stats`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({});
    });

    it('should map camelCase fields from res.data', () => {
      let stats!: AdminStats;
      service.getStats().subscribe((s) => (stats = s));

      httpMock.expectOne(`${API_URL}/api/admin/stats`).flush({
        data: {
          totalStudents: 500,
          totalCourses: 30,
          activeRegistrations: 120,
          departmentsCount: 8,
          recentRegistrations: [
            {
              studentId: 'S001',
              studentName: 'Ali Hassan',
              courseCode: 'CS101',
              courseName: 'Intro to CS',
              timestamp: '2024-01-15',
            },
          ],
        },
      });

      expect(stats.totalStudents).toBe(500);
      expect(stats.totalCourses).toBe(30);
      expect(stats.activeRegistrations).toBe(120);
      expect(stats.departmentsCount).toBe(8);
      expect(stats.recentRegistrations).toHaveLength(1);
      expect(stats.recentRegistrations[0]).toEqual({
        studentId: 'S001',
        studentName: 'Ali Hassan',
        courseCode: 'CS101',
        courseName: 'Intro to CS',
        timestamp: '2024-01-15',
      });
    });

    it('should map snake_case fields from flat response', () => {
      let stats!: AdminStats;
      service.getStats().subscribe((s) => (stats = s));

      httpMock.expectOne(`${API_URL}/api/admin/stats`).flush({
        total_students: 100,
        total_courses: 10,
        active_registrations: 50,
        departments_count: 4,
        recent_registrations: [
          {
            student_id: 'S002',
            student_name: 'Sara Ahmed',
            course_code: 'MATH201',
            course_name: 'Calculus',
            date: '2024-02-01',
          },
        ],
      });

      expect(stats.totalStudents).toBe(100);
      expect(stats.totalCourses).toBe(10);
      expect(stats.activeRegistrations).toBe(50);
      expect(stats.departmentsCount).toBe(4);
      expect(stats.recentRegistrations[0].studentId).toBe('S002');
      expect(stats.recentRegistrations[0].studentName).toBe('Sara Ahmed');
      expect(stats.recentRegistrations[0].timestamp).toBe('2024-02-01');
    });

    it('should use departments field as fallback for departmentsCount', () => {
      let stats!: AdminStats;
      service.getStats().subscribe((s) => (stats = s));

      httpMock.expectOne(`${API_URL}/api/admin/stats`).flush({ departments: 5 });

      expect(stats.departmentsCount).toBe(5);
    });

    it('should default all numbers to 0 and arrays to [] for empty response', () => {
      let stats!: AdminStats;
      service.getStats().subscribe((s) => (stats = s));

      httpMock.expectOne(`${API_URL}/api/admin/stats`).flush({});

      expect(stats.totalStudents).toBe(0);
      expect(stats.totalCourses).toBe(0);
      expect(stats.activeRegistrations).toBe(0);
      expect(stats.departmentsCount).toBe(0);
      expect(stats.recentRegistrations).toEqual([]);
    });

    it('should prefer res.data fields over top-level fields', () => {
      let stats!: AdminStats;
      service.getStats().subscribe((s) => (stats = s));

      httpMock.expectOne(`${API_URL}/api/admin/stats`).flush({
        totalStudents: 1,
        data: { totalStudents: 999 },
      });

      expect(stats.totalStudents).toBe(999);
    });
  });
});
