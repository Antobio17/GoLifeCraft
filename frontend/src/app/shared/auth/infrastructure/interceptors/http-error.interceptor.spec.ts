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
import { httpErrorInterceptor } from "./http-error.interceptor";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";

describe("httpErrorInterceptor", () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockToastService: jasmine.SpyObj<FloatingToastService>;

  beforeEach(() => {
    mockToastService = jasmine.createSpyObj("FloatingToastService", [
      "showToast",
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: FloatingToastService, useValue: mockToastService },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
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

  it("should not show a toast on 401 errors", () => {
    httpClient.get("/api/test").subscribe({ error: () => {} });
    httpMock
      .expectOne("/api/test")
      .flush({}, { status: 401, statusText: "Unauthorized" });

    expect(mockToastService.showToast).not.toHaveBeenCalled();
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
});
