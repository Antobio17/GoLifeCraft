import { AuthSession } from "./auth-session.model";
import { Impersonation } from "./impersonation.model";

export interface ImpersonationState {
  impersonation: Impersonation;
  originalSession: AuthSession;
}
