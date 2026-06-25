import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpGetUsersAdapter } from "./http-get-users.adapter";

describe("HttpGetUsersAdapter", () => {
  let adapter: HttpGetUsersAdapter;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        HttpGetUsersAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    adapter = TestBed.inject(HttpGetUsersAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it("should GET from /api/v1/authorization/users", () => {
    adapter.getUsers(1, 10).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === "/api/v1/authorization/users",
    );
    expect(req.request.method).toBe("GET");
    req.flush({ meta: {}, data: [] });
  });

  it("should send page[number] and page[size] params", () => {
    adapter.getUsers(2, 20).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === "/api/v1/authorization/users",
    );
    expect(req.request.params.get("page[number]")).toBe("2");
    expect(req.request.params.get("page[size]")).toBe("20");
    req.flush({ meta: {}, data: [] });
  });

  it("should include filter[username] when provided", () => {
    adapter.getUsers(1, 10, "john").subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === "/api/v1/authorization/users",
    );
    expect(req.request.params.get("filter[username]")).toBe("john");
    req.flush({ meta: {}, data: [] });
  });

  it("should include filter[email] when provided", () => {
    adapter.getUsers(1, 10, undefined, "john@test.com").subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === "/api/v1/authorization/users",
    );
    expect(req.request.params.get("filter[email]")).toBe("john@test.com");
    req.flush({ meta: {}, data: [] });
  });

  it("should include filter[role] when provided", () => {
    adapter.getUsers(1, 10, undefined, undefined, "admin").subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === "/api/v1/authorization/users",
    );
    expect(req.request.params.get("filter[role]")).toBe("admin");
    req.flush({ meta: {}, data: [] });
  });

  it("should not include optional filters when not provided", () => {
    adapter.getUsers(1, 10).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === "/api/v1/authorization/users",
    );
    expect(req.request.params.has("filter[username]")).toBeFalse();
    expect(req.request.params.has("filter[email]")).toBeFalse();
    expect(req.request.params.has("filter[role]")).toBeFalse();
    req.flush({ meta: {}, data: [] });
  });

  it("should include Authorization header with Bearer token from localStorage", () => {
    localStorage.setItem("token", "stored-token");
    adapter.getUsers(1, 10).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === "/api/v1/authorization/users",
    );
    expect(req.request.headers.get("Authorization")).toBe(
      "Bearer stored-token",
    );
    req.flush({ meta: {}, data: [] });
  });
});
