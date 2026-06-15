import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  let authServiceMock: {
    isLoggedIn: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = { isLoggedIn: vi.fn(), currentUser: vi.fn() };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  function runGuard(): ReturnType<typeof adminGuard> {
    return TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
  }

  it('should return true when logged in as admin', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);
    authServiceMock.currentUser.mockReturnValue({ role: 'admin' });

    expect(runGuard()).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should return false when logged in as student', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);
    authServiceMock.currentUser.mockReturnValue({ role: 'student' });

    expect(runGuard()).toBe(false);
  });

  it('should navigate to /login when logged in as student', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);
    authServiceMock.currentUser.mockReturnValue({ role: 'student' });

    runGuard();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return false when not logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);
    authServiceMock.currentUser.mockReturnValue(null);

    expect(runGuard()).toBe(false);
  });

  it('should navigate to /login when not logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);
    authServiceMock.currentUser.mockReturnValue(null);

    runGuard();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
