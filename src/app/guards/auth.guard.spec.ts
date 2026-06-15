import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceMock: { isLoggedIn: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = { isLoggedIn: vi.fn() };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  function runGuard(): ReturnType<typeof authGuard> {
    return TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
  }

  it('should return true when user is logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);

    expect(runGuard()).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should return false when user is not logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);

    expect(runGuard()).toBe(false);
  });

  it('should navigate to /login when user is not logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);

    runGuard();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
