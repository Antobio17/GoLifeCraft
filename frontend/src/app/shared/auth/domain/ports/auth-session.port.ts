import { AuthSession } from "../models/auth-session.model";

export abstract class AuthSessionPort {
  abstract save(session: AuthSession): void;
  abstract get(): AuthSession | null;
  abstract clear(): void;
  abstract isValid(): boolean;
}
