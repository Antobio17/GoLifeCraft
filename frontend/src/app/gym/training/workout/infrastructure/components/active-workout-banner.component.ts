import { Component, OnInit, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { FloatingWorkoutBannerComponent } from "@shared/design-system/floating-workout-banner/infrastructure/components/floating-workout-banner.component";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ViewportService } from "@shared/viewport/application/services/viewport.service";
import { ActiveWorkoutService } from "@gym/training/workout/application/services/active-workout.service";
import { ActiveWorkoutBannerVisibilityService } from "@gym/training/workout/application/services/active-workout-banner-visibility.service";

@Component({
  selector: "app-active-workout-banner",
  templateUrl: "./active-workout-banner.component.html",
  styleUrls: ["./active-workout-banner.component.css"],
  imports: [ContextualTranslatePipe, FloatingWorkoutBannerComponent],
})
export class ActiveWorkoutBannerComponent implements OnInit {
  protected activeWorkout = inject(ActiveWorkoutService);
  private bannerVisibility = inject(ActiveWorkoutBannerVisibilityService);
  private authSessionService = inject(AuthSessionService);
  private viewportService = inject(ViewportService);
  private router = inject(Router);

  readonly visible = this.bannerVisibility.visible;

  private readonly isWide = this.viewportService.matches("(min-width: 768px)");

  readonly embedded = computed(() => !this.isWide());

  readonly stateKey = computed(() => {
    if (this.activeWorkout.paused()) {
      return "workout.banner.paused";
    }

    if (this.activeWorkout.isFree()) {
      return "workout.banner.freeActive";
    }

    return "workout.banner.active";
  });

  readonly goKey = computed(() =>
    this.activeWorkout.isFree()
      ? "workout.banner.goToWorkout"
      : "workout.banner.goToSession",
  );

  ngOnInit(): void {
    this.restoreActiveWorkout();
  }

  private restoreActiveWorkout(): void {
    if (!this.authSessionService.isAuthenticated()) {
      return;
    }
    this.activeWorkout.ensureRestored().subscribe();
  }

  goToSession(): void {
    this.router.navigate([this.bannerVisibility.workoutPath()]);
  }
}
