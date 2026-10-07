import { Component, DestroyRef, OnInit, inject, signal } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { Router, NavigationEnd, RouterOutlet } from "@angular/router";
import { filter } from "rxjs/operators";
import { FloatingToastComponent } from "@shared/floating-toasts/infrastructure/components/floating-toast.component";
import { BottomNavComponent } from "@layouts/layout/bottom-nav/infrastructure/components/bottom-nav.component";
import { SideDrawerComponent } from "@layouts/layout/side-drawer/infrastructure/components/side-drawer.component";
import { ActiveWorkoutBannerComponent } from "@gym/training/workout/infrastructure/components/active-workout-banner.component";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ImpersonationService } from "@shared/auth/application/services/impersonation.service";
import { ImpersonationBarComponent } from "@shared/design-system/impersonation-bar/infrastructure/components/impersonation-bar.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { GetMyProfileService } from "@authorization/user/user/application/services/get-my-profile.service";
import { GetMyProfileProvider } from "@authorization/user/user/infrastructure/providers/get-my-profile.provider";
import { RouteModuleService } from "@shared/design-system/module-theme/application/services/route-module.service";
import { UnreadNotificationsService } from "@notification/notification/inbox/application/services/unread-notifications.service";

@Component({
  selector: "app-main",
  imports: [
    RouterOutlet,
    FloatingToastComponent,
    BottomNavComponent,
    SideDrawerComponent,
    ActiveWorkoutBannerComponent,
    ImpersonationBarComponent,
    ContextualTranslatePipe,
  ],
  providers: [...GetMyProfileProvider.getProviders()],
  styleUrls: ["./main.component.css"],
  templateUrl: "./main.component.html",
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private authSessionService = inject(AuthSessionService);
  private getMyProfileService = inject(GetMyProfileService);
  private impersonationService = inject(ImpersonationService);
  private unreadNotifications = inject(UnreadNotificationsService);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private routeModuleService = inject(RouteModuleService);

  private readonly PUSH_RECEIVED = "golifecraft.push.received";

  showTabBar = signal(this.computeShowTabBar());
  module = signal(this.routeModuleService.moduleFor(this.router.url));
  navModule = signal(this.routeModuleService.navModuleFor(this.router.url));
  readonly impersonation = this.impersonationService.impersonation;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.showTabBar.set(this.computeShowTabBar());
        this.module.set(this.routeModuleService.moduleFor(this.router.url));
        this.navModule.set(
          this.routeModuleService.navModuleFor(this.router.url),
        );
        this.refreshUnreadNotifications();
      });

    this.refreshProfileName();
    this.watchUnreadNotifications();
  }

  exitImpersonation(): void {
    this.impersonationService
      .revokeAndStop()
      .subscribe({ complete: () => this.router.navigate(["/users"]) });
  }

  private refreshProfileName(): void {
    if (!this.authSessionService.isAuthenticated()) return;

    this.getMyProfileService.getMyProfile().subscribe({
      next: (profile) =>
        this.authSessionService.setUserIdentity(
          profile.data.attributes.name,
          profile.data.attributes.lastname,
          profile.data.attributes.avatar,
        ),
    });
  }

  private watchUnreadNotifications(): void {
    if (!this.authSessionService.isAuthenticated()) return;

    const refreshWhenVisible = () => {
      if ("visible" !== this.document.visibilityState) return;

      this.unreadNotifications.refresh();
    };

    const refreshOnPush = (event: MessageEvent) => {
      if (this.PUSH_RECEIVED !== event.data?.type) return;

      this.unreadNotifications.refresh();
    };

    const serviceWorker = this.document.defaultView?.navigator.serviceWorker;

    this.unreadNotifications.refresh();
    this.document.addEventListener("visibilitychange", refreshWhenVisible);
    serviceWorker?.addEventListener("message", refreshOnPush);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener("visibilitychange", refreshWhenVisible);
      serviceWorker?.removeEventListener("message", refreshOnPush);
    });
  }

  private refreshUnreadNotifications(): void {
    if (!this.authSessionService.isAuthenticated()) return;

    this.unreadNotifications.refresh();
  }

  private computeShowTabBar(): boolean {
    return (
      this.authSessionService.isAuthenticated() &&
      !this.router.url.startsWith("/login")
    );
  }
}
