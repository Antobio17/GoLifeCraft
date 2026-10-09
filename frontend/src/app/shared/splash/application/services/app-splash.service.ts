import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  Router,
} from "@angular/router";
import { filter, take } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class AppSplashService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  private readonly SPLASH_ID = "app-splash";
  private readonly LEAVING_CLASS = "is-leaving";

  dismissOnFirstNavigation(): void {
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
        take(1),
      )
      .subscribe(() => this.dismiss());
  }

  private dismiss(): void {
    const splash = this.document.getElementById(this.SPLASH_ID);

    if (!splash) return;

    splash.addEventListener("transitionend", () => splash.remove(), {
      once: true,
    });
    splash.classList.add(this.LEAVING_CLASS);

    const duration =
      this.document.defaultView?.getComputedStyle(splash).transitionDuration;

    if ("0s" !== duration) return;

    splash.remove();
  }
}
