import { Component, OnInit, inject, signal } from "@angular/core";
import { Router, NavigationEnd, RouterOutlet } from "@angular/router";
import { filter } from "rxjs/operators";
import { FloatingToastComponent } from "@shared/floating-toasts/infrastructure/components/floating-toast.component";
import { BottomNavComponent } from "@layouts/layout/bottom-nav/infrastructure/components/bottom-nav.component";
import { SideDrawerComponent } from "@layouts/layout/side-drawer/infrastructure/components/side-drawer.component";
import { ActiveWorkoutBannerComponent } from "@gym/training/workout/infrastructure/components/active-workout-banner.component";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { GetMyProfileService } from "@authorization/user/user/application/services/get-my-profile.service";
import { GetMyProfileProvider } from "@authorization/user/user/infrastructure/providers/get-my-profile.provider";

@Component({
  selector: "app-main",
  standalone: true,
  imports: [
    RouterOutlet,
    FloatingToastComponent,
    BottomNavComponent,
    SideDrawerComponent,
    ActiveWorkoutBannerComponent,
  ],
  providers: [...GetMyProfileProvider.getProviders()],
  styleUrls: ["./main.component.css"],
  templateUrl: "./main.component.html",
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private authSessionService = inject(AuthSessionService);
  private getMyProfileService = inject(GetMyProfileService);

  showTabBar = signal(this.computeShowTabBar());

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.showTabBar.set(this.computeShowTabBar()));

    this.refreshProfileName();
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
