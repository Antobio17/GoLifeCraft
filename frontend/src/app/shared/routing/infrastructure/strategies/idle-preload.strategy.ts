import { Injectable, inject } from "@angular/core";
import { PreloadingStrategy, Route } from "@angular/router";
import { Observable, mergeMap, of } from "rxjs";
import { IdleSchedulerService } from "../../application/services/idle-scheduler.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";

@Injectable({ providedIn: "root" })
export class IdlePreloadStrategy implements PreloadingStrategy {
  private idleScheduler = inject(IdleSchedulerService);
  private authSessionService = inject(AuthSessionService);

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!this.authSessionService.isAuthenticated()) return of(null);
    if (false === route.data?.["preload"]) return of(null);

    return this.idleScheduler.whenIdle().pipe(mergeMap(() => load()));
  }
}
