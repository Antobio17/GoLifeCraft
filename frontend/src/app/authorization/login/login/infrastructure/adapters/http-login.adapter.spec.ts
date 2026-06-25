import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpLoginAdapter } from "./http-login.adapter";
import { LoginRequest } from "../../domain/models/login-request.model";
import { LoginResponse } from "../../domain/models/login-response.model";

describe("HttpLoginAdapter", () => {
  let adapter: HttpLoginAdapter;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpLoginAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    adapter = TestBed.inject(HttpLoginAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should POST credentials to /api/login", () => {
    const credentials: LoginRequest = { username: "user", password: "pass" };
    adapter.login(credentials).subscribe();

    const req = httpMock.expectOne("/api/login");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(credentials);
    req.flush({} as LoginResponse);
  });

  it("should return the response from the API", (done) => {
    const credentials: LoginRequest = { username: "user", password: "pass" };
    const mockResponse: LoginResponse = {
      data: {
        token: "tok",
        expires_at: 9999,
        token_type: "Bearer",
        user: { username: "user", email: "u@e.com", roles: [] },
      },
    };

    adapter.login(credentials).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne("/api/login").flush(mockResponse);
  });
});
