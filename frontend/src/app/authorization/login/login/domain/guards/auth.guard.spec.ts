import { TestBed } from "@angular/core/testing";
import { Router, UrlTree } from "@angular/router";
import { Observable, of, throwError } from "rxjs";
import { authGuard } from "./auth.guard";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { SessionRefreshService } from "@shared/auth/application/services/session-refresh.service";
import { AuthSession } from "@shared/auth/domain/models/auth-session.model";

describe("authGuard", () => {
  let mockAuthSessionService: jasmine.SpyObj<AuthSessionService>;
  let mockSessionRefreshService: jasmine.SpyObj<SessionRefreshService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let loginUrlTree: UrlTree;

  beforeEach(() => {
    mockAuthSessionService = jasmine.createSpyObj("AuthSessionService", [
      "isAuthenticated",
      "getSession",
    ]);
    mockSessionRefreshService = jasmine.createSpyObj("SessionRefreshService", [
      "refresh",
    ]);
    mockRouter = jasmine.createSpyObj("Router", ["createUrlTree"]);
    loginUrlTree = new UrlTree();
    mockRouter.createUrlTree.and.returnValue(loginUrlTree);
    mockAuthSessionService.getSession.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthSessionService, useValue: mockAuthSessionService },
        { provide: SessionRefreshService, useValue: mockSessionRefreshService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it("should return true when session is authenticated", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard());
    expect(result).toBeTrue();
  });

  it("should not redirect when session is authenticated", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(true);
    TestBed.runInInjectionContext(() => authGuard());
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it("should redirect to /login when not authenticated and no refresh token", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(false);
    mockAuthSessionService.getSession.and.returnValue({} as AuthSession);
    const result = TestBed.runInInjectionContext(() => authGuard());
    expect(result).toBe(loginUrlTree);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(["/login"]);
    expect(mockSessionRefreshService.refresh).not.toHaveBeenCalled();
  });

  it("should allow access when refresh succeeds", (done) => {
    mockAuthSessionService.isAuthenticated.and.returnValue(false);
    mockAuthSessionService.getSession.and.returnValue({
      refreshToken: "refresh-1",
    } as AuthSession);
    mockSessionRefreshService.refresh.and.returnValue(of({} as AuthSession));

    const result = TestBed.runInInjectionContext(() =>
      authGuard(),
    ) as Observable<boolean | UrlTree>;

    result.subscribe((value) => {
      expect(value).toBeTrue();
      done();
    });
  });

  it("should redirect to /login when refresh fails", (done) => {
    mockAuthSessionService.isAuthenticated.and.returnValue(false);
    mockAuthSessionService.getSession.and.returnValue({
      refreshToken: "refresh-1",
    } as AuthSession);
    mockSessionRefreshService.refresh.and.returnValue(
      throwError(() => new Error("refresh-failed")),
    );

    const result = TestBed.runInInjectionContext(() =>
      authGuard(),
    ) as Observable<boolean | UrlTree>;

    result.subscribe((value) => {
      expect(value).toBe(loginUrlTree);
      done();
    });
  });
});
