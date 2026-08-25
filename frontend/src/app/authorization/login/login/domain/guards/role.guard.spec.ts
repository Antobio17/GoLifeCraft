import { TestBed } from "@angular/core/testing";
import { Router, UrlTree } from "@angular/router";
import { godOnlyGuard } from "./role.guard";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { USER_ROLES } from "@authorization/domain/constants/user-roles.constants";

describe("role guards", () => {
  let mockAuthSessionService: jasmine.SpyObj<AuthSessionService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let redirectUrlTree: UrlTree;

  beforeEach(() => {
    mockAuthSessionService = jasmine.createSpyObj("AuthSessionService", [
      "getCurrentUserRole",
    ]);
    mockRouter = jasmine.createSpyObj("Router", ["createUrlTree"]);
    redirectUrlTree = new UrlTree();
    mockRouter.createUrlTree.and.returnValue(redirectUrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthSessionService, useValue: mockAuthSessionService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  describe("godOnlyGuard", () => {
    it("should allow access for a god user", () => {
      mockAuthSessionService.getCurrentUserRole.and.returnValue(USER_ROLES.GOD);

      const result = TestBed.runInInjectionContext(() =>
        godOnlyGuard({} as never, {} as never),
      );

      expect(result).toBeTrue();
    });

    it("should redirect a read only user to /dashboard", () => {
      mockAuthSessionService.getCurrentUserRole.and.returnValue(
        USER_ROLES.USER,
      );

      const result = TestBed.runInInjectionContext(() =>
        godOnlyGuard({} as never, {} as never),
      );

      expect(result).toBe(redirectUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(["/dashboard"]);
    });
  });
});
