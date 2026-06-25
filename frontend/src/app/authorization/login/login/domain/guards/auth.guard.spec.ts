import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { authGuard } from "./auth.guard";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";

describe("authGuard", () => {
  let mockAuthSessionService: jasmine.SpyObj<AuthSessionService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthSessionService = jasmine.createSpyObj("AuthSessionService", [
      "isAuthenticated",
    ]);
    mockRouter = jasmine.createSpyObj("Router", ["navigate"]);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthSessionService, useValue: mockAuthSessionService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it("should return true when session is authenticated", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard());
    expect(result).toBeTrue();
  });

  it("should not navigate when session is authenticated", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(true);
    TestBed.runInInjectionContext(() => authGuard());
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it("should return false when session is not authenticated", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() => authGuard());
    expect(result).toBeFalse();
  });

  it("should navigate to /login when session is not authenticated", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(false);
    TestBed.runInInjectionContext(() => authGuard());
    expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
  });
});
