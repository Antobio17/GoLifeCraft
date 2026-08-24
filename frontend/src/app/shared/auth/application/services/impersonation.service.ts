import { Signal, computed } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { Impersonation } from "../../domain/models/impersonation.model";
import { ImpersonationToken } from "../../domain/models/impersonation-token.model";
import { ImpersonationSessionPort } from "../../domain/ports/impersonation-session.port";
import { RevokeImpersonationPort } from "../../domain/ports/revoke-impersonation.port";
import { AuthSessionService } from "./auth-session.service";

export class ImpersonationService {
  readonly impersonation: Signal<Impersonation | null>;
  readonly isImpersonating: Signal<boolean>;

  constructor(
    private port: ImpersonationSessionPort,
    private revokeImpersonationPort: RevokeImpersonationPort,
    private authSessionService: AuthSessionService,
  ) {
    this.impersonation = computed(() =>
      this.authSessionService.session()
        ? (this.port.get()?.impersonation ?? null)
        : null,
    );
    this.isImpersonating = computed(() => this.impersonation() !== null);
  }

  start(impersonation: Impersonation, token: ImpersonationToken): void {
    const originalSession =
      this.port.get()?.originalSession ?? this.authSessionService.getSession();

    if (!originalSession) return;

    this.port.save({ impersonation, originalSession });
    this.authSessionService.saveSession({
      ...originalSession,
      token: token.token,
      expiresAt: token.expiresAt,
      tokenType: token.tokenType,
      refreshToken: undefined,
    });
  }

  revokeAndStop(): Observable<void> {
    if (!this.isImpersonating()) return of(void 0);

    return this.revokeImpersonationPort.revoke().pipe(
      catchError(() => of(void 0)),
      finalize(() => this.stop()),
    );
  }

  stop(): boolean {
    const state = this.port.get();

    this.port.clear();

    if (!state) return false;

    this.authSessionService.saveSession(state.originalSession);

    return true;
  }
}
