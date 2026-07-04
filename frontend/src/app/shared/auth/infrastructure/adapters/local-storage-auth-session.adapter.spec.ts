import { LocalStorageAuthSessionAdapter } from "./local-storage-auth-session.adapter";
import { AuthSession } from "../../domain/models/auth-session.model";

const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
const pastTimestamp = Math.floor(Date.now() / 1000) - 1;

const mockSession: AuthSession = {
  token: "test-token",
  expiresAt: futureTimestamp,
  tokenType: "Bearer",
  user: { username: "testuser", email: "test@test.com", roles: ["admin"] },
  email: "test@test.com",
};

describe("LocalStorageAuthSessionAdapter", () => {
  let adapter: LocalStorageAuthSessionAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAuthSessionAdapter();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("get", () => {
    it("should return null when localStorage is empty", () => {
      expect(adapter.get()).toBeNull();
    });

    it("should return null when token is missing", () => {
      localStorage.setItem("user", JSON.stringify({ username: "u" }));
      expect(adapter.get()).toBeNull();
    });

    it("should return null when user is missing", () => {
      localStorage.setItem("token", "tok");
      expect(adapter.get()).toBeNull();
    });
  });

  describe("save", () => {
    it("should save and retrieve a session", () => {
      adapter.save(mockSession);
      const retrieved = adapter.get();
      expect(retrieved).not.toBeNull();
      expect(retrieved!.token).toBe("test-token");
      expect(retrieved!.email).toBe("test@test.com");
      expect(retrieved!.tokenType).toBe("Bearer");
    });

    it("should save and retrieve the user object", () => {
      adapter.save(mockSession);
      expect(adapter.get()!.user).toEqual(mockSession.user);
    });
  });

  describe("clear", () => {
    it("should remove all session data from localStorage", () => {
      adapter.save(mockSession);
      adapter.clear();
      expect(adapter.get()).toBeNull();
    });
  });

  describe("isValid", () => {
    it("should return false when no token stored", () => {
      expect(adapter.isValid()).toBeFalse();
    });

    it("should return true when token exists and is not expired", () => {
      adapter.save(mockSession);
      expect(adapter.isValid()).toBeTrue();
    });

    it("should return false when token is expired", () => {
      adapter.save({ ...mockSession, expiresAt: pastTimestamp });
      expect(adapter.isValid()).toBeFalse();
    });
  });
});
