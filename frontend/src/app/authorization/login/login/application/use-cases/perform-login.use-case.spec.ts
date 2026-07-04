import { of } from "rxjs";
import { PerformLoginUseCase } from "./perform-login.use-case";
import { LoginPort } from "../../domain/ports/login.port";
import { LoginResponse } from "../../domain/models/login-response.model";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { GetMyProfilePort } from "@authorization/user/user/domain/ports/get-my-profile.port";
import { GetMyProfileResponse } from "@authorization/user/user/domain/models/get-my-profile-response.model";

const mockLoginResponse: LoginResponse = {
  data: {
    token: "test-token",
    expires_at: 9999999999,
    token_type: "Bearer",
    user: { username: "testuser", email: "test@test.com", roles: ["admin"] },
  },
};

const mockProfileResponse: GetMyProfileResponse = {
  data: {
    id: "user-1",
    type: "user",
    attributes: {
      username: "testuser",
      email: "test@test.com",
      name: null,
      lastname: null,
      role: "ROLE_GOD",
      isActive: true,
    },
  },
};

class MockLoginPort extends LoginPort {
  login = jasmine.createSpy("login").and.returnValue(of(mockLoginResponse));
}

class MockAuthSessionService {
  saveSession = jasmine.createSpy("saveSession");
  getSession = jasmine.createSpy("getSession").and.returnValue(null);
}

class MockGetMyProfilePort extends GetMyProfilePort {
  getMyProfile = jasmine
    .createSpy("getMyProfile")
    .and.returnValue(of(mockProfileResponse));
}

describe("PerformLoginUseCase", () => {
  let useCase: PerformLoginUseCase;
  let mockLoginPort: MockLoginPort;
  let mockAuthSessionService: MockAuthSessionService;
  let mockGetMyProfilePort: MockGetMyProfilePort;

  beforeEach(() => {
    mockLoginPort = new MockLoginPort();
    mockAuthSessionService = new MockAuthSessionService();
    mockGetMyProfilePort = new MockGetMyProfilePort();
    useCase = new PerformLoginUseCase(
      mockLoginPort,
      mockAuthSessionService as unknown as AuthSessionService,
      mockGetMyProfilePort,
    );
  });

  it("should call loginPort.login with the correct credentials", (done) => {
    useCase.execute("test@test.com", "pass").subscribe(() => {
      expect(mockLoginPort.login).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "pass",
      });
      done();
    });
  });

  it("should save the session after successful login", (done) => {
    useCase.execute("test@test.com", "pass").subscribe(() => {
      expect(mockAuthSessionService.saveSession).toHaveBeenCalledWith(
        jasmine.objectContaining({
          token: "test-token",
          email: "test@test.com",
          tokenType: "Bearer",
        }),
      );
      done();
    });
  });

  it("should fetch the profile after successful login", (done) => {
    useCase.execute("test@test.com", "pass").subscribe(() => {
      expect(mockGetMyProfilePort.getMyProfile).toHaveBeenCalled();
      done();
    });
  });
});
