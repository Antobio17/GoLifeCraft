import { ImpersonationState } from "../models/impersonation-state.model";

export abstract class ImpersonationSessionPort {
  abstract save(state: ImpersonationState): void;
  abstract get(): ImpersonationState | null;
  abstract clear(): void;
}
