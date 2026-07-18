import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import {
  provideHttpClient,
  withInterceptors,
  HttpClient,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { authTokenInterceptor } from "./auth-token.interceptor";
import { AuthSessionService } from "../../application/services/auth-session.service";
import { SessionRefreshService } from "../../application/services/session-refresh.service";
import { AuthSession } from "../../domain/models/auth-session.model";

const mockSession: AuthSession = {
  token: "my-token",
  tokenType: "Bearer",
  expiresAt: 9999999999,
  refreshToken: "my-refresh-token",
  user: { username: "u", email: "e", roles: [] },
  email: "e",
};

describe("authTokenInterceptor", () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockAuthSession: jasmine.SpyObj<AuthSessionService>;
  let mockSessionRefresh: jasmine.SpyObj<SessionRefreshService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthSession = jasmine.createSpyObj("AuthSessionService", [
      "getSession",
      "clearSession",
    ]);
    mockSessionRefresh = jasmine.createSpyObj("SessionRefreshService", [
      "refresh",
    ]);
    mockRouter = jasmine.createSpyObj("Router", ["navigate"], {
      url: "/dashboard",
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthSessionService, useValue: mockAuthSession },
        { provide: SessionRefreshService, useValue: mockSessionRefresh },
        { provide: Router, useValue: mockRouter },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should add Authorization header when a token exists", () => {
    mockAuthSession.getSession.and.returnValue(mockSession);

    httpClient.get("/api/test").subscribe();
    const req = httpMock.expectOne("/api/test");

    expect(req.request.headers.get("Authorization")).toBe("Bearer my-token");
    req.flush({});
  });

  it("should not add Authorization header when session is null", () => {
    mockAuthSession.getSession.and.returnValue(null);

    httpClient.get("/api/test").subscribe();
    const req = httpMock.expectOne("/api/test");

    expect(req.request.headers.has("Authorization")).toBeFalse();
    req.flush({});
  });

  it("should not add Authorization header to the refresh endpoint", () => {
    mockAuthSession.getSession.and.returnValue(mockSession);

    httpClient.post("/api/token/refresh", {}).subscribe();
    const req = httpMock.expectOne("/api/token/refresh");

    expect(req.request.headers.has("Authorization")).toBeFalse();
    req.flush({});
  });

  it("should refresh the token and retry the request on 401", () => {
    const refreshedSession: AuthSession = {
      ...mockSession,
      token: "new-token",
    };
    mockAuthSession.getSession.and.returnValue(mockSession);
    mockSessionRefresh.refresh.and.returnValue(of(refreshedSession));

    httpClient.get("/api/test").subscribe();

    httpMock
      .expectOne("/api/test")
      .flush({}, { status: 401, statusText: "Unauthorized" });

    const retried = httpMock.expectOne("/api/test");
    expect(retried.request.headers.get("Authorization")).toBe(
      "Bearer new-token",
    );
    retried.flush({});
    expect(mockSessionRefresh.refresh).toHaveBeenCalledTimes(1);
  });

  it("should log out when a 401 has no refresh token available", () => {
    mockAuthSession.getSession.and.returnValue({
      ...mockSession,
      refreshToken: undefined,
    });

    httpClient.get("/api/test").subscribe({ error: () => {} });
    httpMock
      .expectOne("/api/test")
      .flush({}, { status: 401, statusText: "Unauthorized" });

    expect(mockAuthSession.clearSession).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
  });

  it("should log out when the refresh itself fails", () => {
    mockAuthSession.getSession.and.returnValue(mockSession);
    mockSessionRefresh.refresh.and.returnValue(
      throwError(() => new Error("refresh-failed")),
    );

    httpClient.get("/api/test").subscribe({ error: () => {} });
    httpMock
      .expectOne("/api/test")
      .flush({}, { status: 401, statusText: "Unauthorized" });

    expect(mockAuthSession.clearSession).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
  });
});
