import { Location } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from "@angular/router";

@Injectable({ providedIn: "root" })
export class BackNavigationService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private depth = 0;
  private pendingDelta = 0;

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.pendingDelta = this.deltaOf(event);

        return;
      }

      if (event instanceof NavigationCancel) {
        this.pendingDelta = 0;

        return;
      }

      if (event instanceof NavigationError) {
        this.pendingDelta = 0;

        return;
      }

      if (!(event instanceof NavigationEnd)) return;

      this.depth = Math.max(0, this.depth + this.pendingDelta);
      this.pendingDelta = 0;
    });
  }

  canGoBack(): boolean {
    return this.depth > 0;
  }

  back(fallback: unknown[]): void {
    if (0 === this.depth) {
      void this.router.navigate(fallback);

      return;
    }

    this.location.back();
  }

  private deltaOf(event: NavigationStart): number {
    if ("popstate" === event.navigationTrigger) return -1;

    const navigation = this.router.getCurrentNavigation();

    if (undefined === navigation || null === navigation) return 0;
    if (null === navigation.previousNavigation) return 0;
    if (true === navigation.extras.replaceUrl) return 0;

    return 1;
  }
}
