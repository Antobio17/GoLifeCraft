import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingWorkoutBannerComponent } from "@shared/design-system/floating-workout-banner/infrastructure/components/floating-workout-banner.component";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ActiveWorkoutService } from "@gym/training/workout/application/services/active-workout.service";

@Component({
  selector: "app-active-workout-banner",
  templateUrl: "./active-workout-banner.component.html",
  styleUrls: ["./active-workout-banner.component.css"],
  imports: [ContextualTranslatePipe, FloatingWorkoutBannerComponent],
})
export class ActiveWorkoutBannerComponent implements OnInit {
  protected activeWorkout = inject(ActiveWorkoutService);
  private authSessionService = inject(AuthSessionService);
  private router = inject(Router);

  private readonly currentPath = signal(this.pathOf(this.router.url));

  readonly visible = computed(() => {
    if (!this.activeWorkout.isActive()) {
      return false;
    }
    const sessionId = this.activeWorkout.activeSessionId();
    return this.currentPath() !== `/gym/sessions/${sessionId}`;
  });

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) =>
        this.currentPath.set(
          this.pathOf((event as NavigationEnd).urlAfterRedirects),
        ),
      );

    this.restoreActiveWorkout();
  }

  private restoreActiveWorkout(): void {
    if (!this.authSessionService.isAuthenticated()) {
      return;
    }
    this.activeWorkout.ensureRestored().subscribe();
  }

  private pathOf(url: string): string {
    return url.split("?")[0];
  }

  goToSession(): void {
    const sessionId = this.activeWorkout.activeSessionId();
    if (!sessionId) {
      return;
    }
    this.router.navigate(["/gym/sessions", sessionId]);
  }
}
