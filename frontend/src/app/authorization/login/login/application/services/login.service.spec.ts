import { of } from "rxjs";
import { LoginService } from "./login.service";
import { LoginPort } from "../../domain/ports/login.port";
import { LoginRequest } from "../../domain/models/login-request.model";
import { LoginResponse } from "../../domain/models/login-response.model";

const mockResponse: LoginResponse = {
  data: {
    token: "test-token",
    expires_at: 9999999999,
    token_type: "Bearer",
    user: { username: "testuser", email: "test@test.com", roles: ["admin"] },
  },
};

class MockLoginPort extends LoginPort {
  login = jasmine.createSpy("login").and.returnValue(of(mockResponse));
}

describe("LoginService", () => {
  let service: LoginService;
  let mockPort: MockLoginPort;

  beforeEach(() => {
    mockPort = new MockLoginPort();
    service = new LoginService(mockPort);
  });

  it("should delegate login to the port with given credentials", () => {
    const credentials: LoginRequest = { email: "user", password: "pass" };
    service.login(credentials).subscribe();
    expect(mockPort.login).toHaveBeenCalledWith(credentials);
  });

  it("should return the observable from the port", (done) => {
    const credentials: LoginRequest = { email: "user", password: "pass" };
    service.login(credentials).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });
  });
});
