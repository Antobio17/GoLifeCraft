import { Signal, WritableSignal, signal } from "@angular/core";
import { AuthSession, AuthUser } from "../../domain/models/auth-session.model";
import { AuthSessionPort } from "../../domain/ports/auth-session.port";

export class AuthSessionService {
  private readonly _session: WritableSignal<AuthSession | null>;
  readonly session: Signal<AuthSession | null>;

  constructor(private port: AuthSessionPort) {
    this._session = signal(this.port.get());
    this.session = this._session.asReadonly();
  }

  saveSession(session: AuthSession): void {
    this.port.save(session);
    this._session.set(session);
  }

  getSession(): AuthSession | null {
    return this._session();
  }

  clearSession(): void {
    this.port.clear();
    this._session.set(null);
  }

  isAuthenticated(): boolean {
    return this.port.isValid();
  }

  getCurrentUser(): AuthUser | null {
    return this._session()?.user ?? null;
  }

  getCurrentUserRole(): string {
    const user = this.getCurrentUser();
    return user?.role ?? user?.roles?.[0] ?? "";
  }

  getUsername(): string {
    return this._session()?.username ?? "";
  }

  isGod(): boolean {
    return this.getCurrentUserRole() === "ROLE_GOD";
  }
}
