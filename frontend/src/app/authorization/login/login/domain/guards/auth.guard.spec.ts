import { TestBed } from "@angular/core/testing";
import { Router, UrlTree } from "@angular/router";
import { authGuard } from "./auth.guard";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";

describe("authGuard", () => {
  let mockAuthSessionService: jasmine.SpyObj<AuthSessionService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let loginUrlTree: UrlTree;

  beforeEach(() => {
    mockAuthSessionService = jasmine.createSpyObj("AuthSessionService", [
      "isAuthenticated",
    ]);
    mockRouter = jasmine.createSpyObj("Router", ["createUrlTree"]);
    loginUrlTree = new UrlTree();
    mockRouter.createUrlTree.and.returnValue(loginUrlTree);

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

  it("should not redirect when session is authenticated", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(true);
    TestBed.runInInjectionContext(() => authGuard());
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it("should return a redirect UrlTree when session is not authenticated", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() => authGuard());
    expect(result).toBe(loginUrlTree);
  });

  it("should redirect to /login when session is not authenticated", () => {
    mockAuthSessionService.isAuthenticated.and.returnValue(false);
    TestBed.runInInjectionContext(() => authGuard());
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(["/login"]);
  });
});
