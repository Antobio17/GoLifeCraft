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
import { httpErrorInterceptor } from "./http-error.interceptor";
import { AuthSessionService } from "../../application/services/auth-session.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";

describe("httpErrorInterceptor", () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockAuthSession: jasmine.SpyObj<AuthSessionService>;
  let mockToastService: jasmine.SpyObj<FloatingToastService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthSession = jasmine.createSpyObj("AuthSessionService", [
      "clearSession",
    ]);
    mockToastService = jasmine.createSpyObj("FloatingToastService", [
      "showToast",
    ]);
    mockRouter = jasmine.createSpyObj("Router", ["navigate"], {
      url: "/dashboard",
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthSessionService, useValue: mockAuthSession },
        { provide: FloatingToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should clear session and navigate to /login on 401 error", () => {
    httpClient.get("/api/test").subscribe({ error: () => {} });
    httpMock
      .expectOne("/api/test")
      .flush({}, { status: 401, statusText: "Unauthorized" });

    expect(mockAuthSession.clearSession).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
  });

  it("should show toast when error response contains errors array", () => {
    const errorObj = { status: 422, keyTranslation: "validation", details: [] };
    httpClient.get("/api/test").subscribe({ error: () => {} });
    httpMock
      .expectOne("/api/test")
      .flush(
        { errors: [errorObj] },
        { status: 422, statusText: "Unprocessable Entity" },
      );

    expect(mockToastService.showToast).toHaveBeenCalledWith(errorObj);
  });

  it("should show a generic toast when error response has no errors array", () => {
    httpClient.get("/api/test").subscribe({ error: () => {} });
    httpMock
      .expectOne("/api/test")
      .flush(
        { message: "Internal error" },
        { status: 500, statusText: "Server Error" },
      );

    expect(mockToastService.showToast).toHaveBeenCalledWith({
      status: 500,
      keyTranslation: "error.server.generic",
      details: [],
    });
  });

  it("should rethrow the error after handling", (done) => {
    httpClient.get("/api/test").subscribe({
      error: (err) => {
        expect(err.status).toBe(500);
        done();
      },
    });
    httpMock
      .expectOne("/api/test")
      .flush({}, { status: 500, statusText: "Server Error" });
  });

  it("should not clear session or navigate on non-401 errors", () => {
    httpClient.get("/api/test").subscribe({ error: () => {} });
    httpMock
      .expectOne("/api/test")
      .flush({}, { status: 403, statusText: "Forbidden" });

    expect(mockAuthSession.clearSession).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
