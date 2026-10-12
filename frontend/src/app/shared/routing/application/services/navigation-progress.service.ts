import { Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
} from "@angular/router";
import { filter, map } from "rxjs";

type NavigationLifecycleEvent =
  | NavigationStart
  | NavigationEnd
  | NavigationCancel
  | NavigationError
  | NavigationSkipped;

@Injectable({ providedIn: "root" })
export class NavigationProgressService {
  private readonly router = inject(Router);

  private readonly lifecycle$ = this.router.events.pipe(
    filter(
      (event: Event): event is NavigationLifecycleEvent =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        event instanceof NavigationSkipped,
    ),
  );

  readonly navigating = toSignal(
    this.lifecycle$.pipe(map((event) => event instanceof NavigationStart)),
    { initialValue: false },
  );

  readonly targetUrl = toSignal(
    this.lifecycle$.pipe(map((event) => this.urlOf(event))),
    { initialValue: this.router.url },
  );

  private urlOf(event: NavigationLifecycleEvent): string {
    if (event instanceof NavigationStart) return event.url;
    if (event instanceof NavigationEnd) return event.urlAfterRedirects;

    return this.router.url;
  }
}
