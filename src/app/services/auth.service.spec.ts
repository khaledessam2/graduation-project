import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

const API_URL = 'https://unismart-backend-one.vercel.app';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should start with null currentUser when localStorage is empty', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should load user from localStorage on init', () => {
      localStorage.clear();
      const mockUser = {
        id: 1, name: 'Test User', role: 'student' as const, department: 'CS',
        studentId: '123', nationalId: '123', email: '', yearOfStudy: '', gpa: 3.0,
        passedHours: 60, availableHours: 18,
      };
      localStorage.setItem('unismart_user', JSON.stringify(mockUser));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Router, useValue: routerSpy },
        ],
      });
      const freshService = TestBed.inject(AuthService);
      expect(freshService.currentUser()).toEqual(mockUser);
    });

    it('should return null when localStorage has invalid JSON', () => {
      localStorage.setItem('unismart_user', 'not-valid-json{{{');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Router, useValue: routerSpy },
        ],
      });
      const freshService = TestBed.inject(AuthService);
      expect(freshService.currentUser()).toBeNull();
    });
  });

  describe('getUniversityId', () => {
    it('should return null when not stored', () => {
      expect(service.getUniversityId()).toBeNull();
    });

    it('should return stored university ID', () => {
      localStorage.setItem('unismart_uid', '20210001');
      expect(service.getUniversityId()).toBe('20210001');
    });
  });

  describe('getToken', () => {
    it('should return null when no token stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return stored token', () => {
      localStorage.setItem('unismart_token', 'abc-token-123');
      expect(service.getToken()).toBe('abc-token-123');
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when currentUser is null', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when user is loaded from localStorage', () => {
      localStorage.clear();
      localStorage.setItem('unismart_user', JSON.stringify({ id: 1, role: 'student' }));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Router, useValue: routerSpy },
        ],
      });
      const freshService = TestBed.inject(AuthService);
      expect(freshService.isLoggedIn()).toBe(true);
    });
  });

  describe('login', () => {
    it('should return success and set token using res.data format', () => {
      let result: any;
      service.login('20210001', 'pass123', 'student').subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${API_URL}/api/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ universityId: '20210001', password: 'pass123', role: 'student' });

      req.flush({
        message: 'Login successful',
        data: { role: 'student', token: 'jwt-token', student: { name: 'Ahmed', gpa: 3.5, department: 'CS' } },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(localStorage.getItem('unismart_token')).toBe('jwt-token');
      expect(localStorage.getItem('unismart_uid')).toBe('20210001');
      expect(service.currentUser()?.name).toBe('Ahmed');
      expect(service.currentUser()?.department).toBe('CS');
      expect(service.currentUser()?.role).toBe('student');
    });

    it('should handle fallback res.token format', () => {
      let result: any;
      service.login('20210001', 'pass', 'student').subscribe((r) => (result = r));

      httpMock.expectOne(`${API_URL}/api/login`).flush({
        token: 'fallback-token',
        student: { name: 'Sara', gpa: 3.0, department: 'IT' },
      });

      expect(result.success).toBe(true);
      expect(localStorage.getItem('unismart_token')).toBe('fallback-token');
      expect(service.currentUser()?.name).toBe('Sara');
    });

    it('should normalize role to lowercase', () => {
      service.login('20210001', 'pass', 'ADMIN').subscribe();
      httpMock.expectOne(`${API_URL}/api/login`).flush({ data: { role: 'ADMIN', token: 't' } });
      expect(service.currentUser()?.role).toBe('admin');
    });

    it('should return success:false with server message on HTTP 401', () => {
      let result: any;
      service.login('bad', 'creds', 'student').subscribe((r) => (result = r));

      httpMock.expectOne(`${API_URL}/api/login`).flush(
        { message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    it('should return default error message when error body is empty', () => {
      let result: any;
      service.login('bad', 'creds', 'student').subscribe((r) => (result = r));

      httpMock.expectOne(`${API_URL}/api/login`).flush(null, { status: 500, statusText: 'Server Error' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Login failed. Please check your credentials.');
    });

    it('should use err.error.detail as fallback message', () => {
      let result: any;
      service.login('bad', 'creds', 'student').subscribe((r) => (result = r));

      httpMock.expectOne(`${API_URL}/api/login`).flush(
        { detail: 'Authentication failed' },
        { status: 403, statusText: 'Forbidden' },
      );

      expect(result.message).toBe('Authentication failed');
    });
  });

  describe('updateStats', () => {
    it('should do nothing when currentUser is null', () => {
      expect(() => service.updateStats(3.5, 60, 18)).not.toThrow();
      expect(service.currentUser()).toBeNull();
    });

    it('should update gpa, passedHours, and availableHours on currentUser', () => {
      service.login('123', 'pass', 'student').subscribe();
      httpMock.expectOne(`${API_URL}/api/login`).flush({
        data: { token: 't', student: { name: 'Ali', gpa: 2.0, department: 'CS' } },
      });

      service.updateStats(3.8, 90, 12);

      expect(service.currentUser()?.gpa).toBe(3.8);
      expect(service.currentUser()?.passedHours).toBe(90);
      expect(service.currentUser()?.availableHours).toBe(12);
    });

    it('should update name when name argument is provided', () => {
      service.login('123', 'pass', 'student').subscribe();
      httpMock.expectOne(`${API_URL}/api/login`).flush({
        data: { token: 't', student: { name: 'Old Name' } },
      });

      service.updateStats(3.0, 60, 18, 'New Name');

      expect(service.currentUser()?.name).toBe('New Name');
    });

    it('should persist updated stats to localStorage', () => {
      service.login('123', 'pass', 'student').subscribe();
      httpMock.expectOne(`${API_URL}/api/login`).flush({
        data: { token: 't', student: { name: 'Ali' } },
      });

      service.updateStats(3.9, 100, 6);

      const stored = JSON.parse(localStorage.getItem('unismart_user')!);
      expect(stored.gpa).toBe(3.9);
      expect(stored.passedHours).toBe(100);
    });
  });

  describe('logout', () => {
    it('should clear all localStorage keys', () => {
      localStorage.setItem('unismart_token', 'token');
      localStorage.setItem('unismart_user', '{}');
      localStorage.setItem('unismart_uid', '123');

      service.logout();

      expect(localStorage.getItem('unismart_token')).toBeNull();
      expect(localStorage.getItem('unismart_user')).toBeNull();
      expect(localStorage.getItem('unismart_uid')).toBeNull();
    });

    it('should set currentUser to null', () => {
      service.logout();
      expect(service.currentUser()).toBeNull();
    });

    it('should navigate to /login', () => {
      service.logout();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
