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
import { authTokenInterceptor } from "./auth-token.interceptor";
import { AuthSessionService } from "../../application/services/auth-session.service";
import { AuthSession } from "../../domain/models/auth-session.model";

const mockSession: AuthSession = {
  token: "my-token",
  tokenType: "Bearer",
  expiresAt: 9999999999,
  user: { username: "u", email: "e", roles: [] },
  email: "e",
};

describe("authTokenInterceptor", () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockAuthSession: jasmine.SpyObj<AuthSessionService>;

  beforeEach(() => {
    mockAuthSession = jasmine.createSpyObj("AuthSessionService", [
      "getSession",
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthSessionService, useValue: mockAuthSession },
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

  it("should not add Authorization header when token is empty", () => {
    mockAuthSession.getSession.and.returnValue({
      ...mockSession,
      token: "",
    });

    httpClient.get("/api/test").subscribe();
    const req = httpMock.expectOne("/api/test");

    expect(req.request.headers.has("Authorization")).toBeFalse();
    req.flush({});
  });

  it("should use the tokenType from session in the Authorization header", () => {
    mockAuthSession.getSession.and.returnValue({
      ...mockSession,
      tokenType: "Token",
      token: "my-api-key",
    });

    httpClient.get("/api/test").subscribe();
    const req = httpMock.expectOne("/api/test");

    expect(req.request.headers.get("Authorization")).toBe("Token my-api-key");
    req.flush({});
  });
});
