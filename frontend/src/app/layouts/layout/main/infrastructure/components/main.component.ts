import { Component, OnInit, inject, signal } from "@angular/core";
import { Router, NavigationEnd, RouterOutlet } from "@angular/router";
import { filter } from "rxjs/operators";
import { FloatingToastComponent } from "@shared/floating-toasts/infrastructure/components/floating-toast.component";
import { BottomNavComponent } from "@layouts/layout/bottom-nav/infrastructure/components/bottom-nav.component";
import { SideDrawerComponent } from "@layouts/layout/side-drawer/infrastructure/components/side-drawer.component";
import { ActiveWorkoutBannerComponent } from "@gym/training/workout/infrastructure/components/active-workout-banner.component";
import { ActiveWorkoutBannerVisibilityService } from "@gym/training/workout/application/services/active-workout-banner-visibility.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ImpersonationService } from "@shared/auth/application/services/impersonation.service";
import { ImpersonationBarComponent } from "@shared/design-system/impersonation-bar/infrastructure/components/impersonation-bar.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { GetMyProfileService } from "@authorization/user/user/application/services/get-my-profile.service";
import { GetMyProfileProvider } from "@authorization/user/user/infrastructure/providers/get-my-profile.provider";

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
  private workoutBannerVisibility = inject(
    ActiveWorkoutBannerVisibilityService,
  );

  showTabBar = signal(this.computeShowTabBar());
  readonly impersonation = this.impersonationService.impersonation;
  readonly workoutTagVisible = this.workoutBannerVisibility.visible;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.showTabBar.set(this.computeShowTabBar()));

    this.refreshProfileName();
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
        ),
    });
  }

  private computeShowTabBar(): boolean {
    return (
      this.authSessionService.isAuthenticated() &&
      !this.router.url.startsWith("/login")
    );
  }
}
