import { AuthSessionService } from "./auth-session.service";
import { AuthSessionPort } from "../../domain/ports/auth-session.port";
import { AuthSession } from "../../domain/models/auth-session.model";

const mockSession: AuthSession = {
  token: "test-token",
  expiresAt: 9999999999,
  tokenType: "Bearer",
  user: { username: "testuser", email: "test@test.com", roles: ["admin"] },
  username: "testuser",
};

class MockAuthSessionPort extends AuthSessionPort {
  save = jasmine.createSpy("save");
  get = jasmine.createSpy("get").and.returnValue(null);
  clear = jasmine.createSpy("clear");
  isValid = jasmine.createSpy("isValid").and.returnValue(false);
}

describe("AuthSessionService", () => {
  let service: AuthSessionService;
  let mockPort: MockAuthSessionPort;

  beforeEach(() => {
    mockPort = new MockAuthSessionPort();
    service = new AuthSessionService(mockPort);
  });

  it("should initialize session from port on construction", () => {
    mockPort.get.and.returnValue(mockSession);
    const s = new AuthSessionService(mockPort);
    expect(s.getSession()).toEqual(mockSession);
  });

  it("should start with null session when port returns null", () => {
    expect(service.getSession()).toBeNull();
  });

  describe("saveSession", () => {
    it("should call port.save and update the signal", () => {
      service.saveSession(mockSession);
      expect(mockPort.save).toHaveBeenCalledWith(mockSession);
      expect(service.getSession()).toEqual(mockSession);
    });
  });

  describe("clearSession", () => {
    it("should call port.clear and set session to null", () => {
      service.saveSession(mockSession);
      service.clearSession();
      expect(mockPort.clear).toHaveBeenCalled();
      expect(service.getSession()).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should delegate to port.isValid and return true", () => {
      mockPort.isValid.and.returnValue(true);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it("should delegate to port.isValid and return false", () => {
      mockPort.isValid.and.returnValue(false);
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe("getCurrentUser", () => {
    it("should return null when no session", () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it("should return user from session", () => {
      service.saveSession(mockSession);
      expect(service.getCurrentUser()).toEqual(mockSession.user);
    });
  });

  describe("getCurrentUserRole", () => {
    it("should return empty string when no session", () => {
      expect(service.getCurrentUserRole()).toBe("");
    });

    it("should return role property when present", () => {
      service.saveSession({
        ...mockSession,
        user: { ...mockSession.user, role: "supervisor" },
      });
      expect(service.getCurrentUserRole()).toBe("supervisor");
    });

    it("should return first element of roles array when role property is absent", () => {
      service.saveSession({
        ...mockSession,
        user: { username: "u", email: "e", roles: ["viewer"] },
      });
      expect(service.getCurrentUserRole()).toBe("viewer");
    });
  });

  describe("getUsername", () => {
    it("should return empty string when no session", () => {
      expect(service.getUsername()).toBe("");
    });

    it("should return username from session", () => {
      service.saveSession(mockSession);
      expect(service.getUsername()).toBe("testuser");
    });
  });

  describe("session signal", () => {
    it("should expose readonly session signal", () => {
      service.saveSession(mockSession);
      expect(service.session()).toEqual(mockSession);
    });
  });
});
