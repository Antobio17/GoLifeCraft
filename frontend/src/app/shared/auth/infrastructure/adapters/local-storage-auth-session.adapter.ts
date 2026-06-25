import { Injectable } from "@angular/core";
import { AuthSession } from "../../domain/models/auth-session.model";
import { AuthSessionPort } from "../../domain/ports/auth-session.port";

@Injectable()
export class LocalStorageAuthSessionAdapter extends AuthSessionPort {
  private readonly KEYS = {
    TOKEN: "token",
    EXPIRES_AT: "expires_at",
    TOKEN_TYPE: "token_type",
    USER: "user",
    USERNAME: "username",
  } as const;

  save(session: AuthSession): void {
    localStorage.setItem(this.KEYS.TOKEN, session.token);
    localStorage.setItem(this.KEYS.EXPIRES_AT, session.expiresAt.toString());
    localStorage.setItem(this.KEYS.TOKEN_TYPE, session.tokenType);
    localStorage.setItem(this.KEYS.USER, JSON.stringify(session.user));
    localStorage.setItem(this.KEYS.USERNAME, session.username);
  }

  get(): AuthSession | null {
    const token = localStorage.getItem(this.KEYS.TOKEN);
    const user = localStorage.getItem(this.KEYS.USER);

    if (!token || !user) return null;

    const expiresAt = localStorage.getItem(this.KEYS.EXPIRES_AT);
    const tokenType = localStorage.getItem(this.KEYS.TOKEN_TYPE);
    const username = localStorage.getItem(this.KEYS.USERNAME);

    try {
      return {
        token,
        expiresAt: expiresAt ? parseInt(expiresAt) : 0,
        tokenType: tokenType ?? "Bearer",
        user: JSON.parse(user),
        username: username ?? "",
      };
    } catch {
      return null;
    }
  }

  clear(): void {
    Object.values(this.KEYS).forEach((key) => localStorage.removeItem(key));
  }

  isValid(): boolean {
    const token = localStorage.getItem(this.KEYS.TOKEN);
    const expiresAt = localStorage.getItem(this.KEYS.EXPIRES_AT);
    return (
      !!token &&
      !!expiresAt &&
      new Date(parseInt(expiresAt) * 1000) > new Date()
    );
  }
}
