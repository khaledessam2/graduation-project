import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { apiInterceptor } from './api.interceptor';
import { environment } from '../../environments/environment';

describe('apiInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: {
    getToken: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof vi.fn>;
  };
  let loadingServiceMock: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = { getToken: vi.fn(), currentUser: vi.fn() };
    loadingServiceMock = { start: vi.fn(), stop: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call loading.start() on every request', () => {
    authServiceMock.getToken.mockReturnValue(null);
    authServiceMock.currentUser.mockReturnValue(null);

    httpClient.get(`${environment.apiUrl}/api/test`).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/test`).flush({});

    expect(loadingServiceMock.start).toHaveBeenCalledTimes(1);
  });

  it('should call loading.stop() after request completes', () => {
    authServiceMock.getToken.mockReturnValue(null);
    authServiceMock.currentUser.mockReturnValue(null);

    httpClient.get(`${environment.apiUrl}/api/test`).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/test`).flush({});

    expect(loadingServiceMock.stop).toHaveBeenCalledTimes(1);
  });

  it('should add Content-Type: application/json to every request', () => {
    authServiceMock.getToken.mockReturnValue(null);
    authServiceMock.currentUser.mockReturnValue(null);

    httpClient.get(`${environment.apiUrl}/api/test`).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/test`);

    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({});
  });

  it('should add Authorization header when token exists and URL matches apiUrl', () => {
    authServiceMock.getToken.mockReturnValue('valid-jwt-token');
    authServiceMock.currentUser.mockReturnValue({ role: 'student' });

    httpClient.get(`${environment.apiUrl}/api/grades`).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/grades`);

    expect(req.request.headers.get('Authorization')).toBe('Bearer valid-jwt-token');
    req.flush({});
  });

  it('should add x-user-role header when user has a role', () => {
    authServiceMock.getToken.mockReturnValue('token');
    authServiceMock.currentUser.mockReturnValue({ role: 'admin' });

    httpClient.get(`${environment.apiUrl}/api/admin/stats`).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/admin/stats`);

    expect(req.request.headers.get('x-user-role')).toBe('admin');
    req.flush({});
  });

  it('should NOT add Authorization header for requests to non-API URLs', () => {
    authServiceMock.getToken.mockReturnValue('valid-jwt-token');
    authServiceMock.currentUser.mockReturnValue({ role: 'student' });

    httpClient.get('https://other-service.com/data').subscribe();
    const req = httpMock.expectOne('https://other-service.com/data');

    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('should NOT add x-user-role header for requests to non-API URLs', () => {
    authServiceMock.getToken.mockReturnValue('token');
    authServiceMock.currentUser.mockReturnValue({ role: 'admin' });

    httpClient.get('https://other-service.com/data').subscribe();
    const req = httpMock.expectOne('https://other-service.com/data');

    expect(req.request.headers.get('x-user-role')).toBeNull();
    req.flush({});
  });

  it('should NOT add Authorization header when no token', () => {
    authServiceMock.getToken.mockReturnValue(null);
    authServiceMock.currentUser.mockReturnValue(null);

    httpClient.get(`${environment.apiUrl}/api/grades`).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/grades`);

    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });
});
