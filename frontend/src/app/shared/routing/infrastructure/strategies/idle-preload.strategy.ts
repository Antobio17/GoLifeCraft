import { Injectable, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { PreloadingStrategy, Route } from "@angular/router";
import { Observable, mergeMap, of } from "rxjs";
import { IdleSchedulerService } from "../../application/services/idle-scheduler.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { PreloadMode } from "../../domain/models/preload-mode.enum";

type DataSaverNavigator = Navigator & {
  connection?: { saveData?: boolean };
};

@Injectable({ providedIn: "root" })
export class IdlePreloadStrategy implements PreloadingStrategy {
  private idleScheduler = inject(IdleSchedulerService);
  private authSessionService = inject(AuthSessionService);
  private navigator = inject(DOCUMENT).defaultView?.navigator as
    | DataSaverNavigator
    | undefined;

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (!this.authSessionService.isAuthenticated()) return of(null);
    if (false === route.data?.["preload"]) return of(null);
    if (this.isEager(route)) return load();

    return this.idleScheduler.whenIdle().pipe(mergeMap(() => load()));
  }

  private isEager(route: Route): boolean {
    if (PreloadMode.Eager !== route.data?.["preload"]) return false;

    return true !== this.navigator?.connection?.saveData;
  }
}
