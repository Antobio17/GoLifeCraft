import { Injectable } from "@angular/core";
import { ImpersonationState } from "../../domain/models/impersonation-state.model";
import { ImpersonationSessionPort } from "../../domain/ports/impersonation-session.port";

@Injectable()
export class LocalStorageImpersonationSessionAdapter extends ImpersonationSessionPort {
  private readonly KEY = "impersonation";

  save(state: ImpersonationState): void {
    localStorage.setItem(this.KEY, JSON.stringify(state));
  }

  get(): ImpersonationState | null {
    const raw = localStorage.getItem(this.KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as ImpersonationState;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(this.KEY);
  }
}
