import { Component, OnInit, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { WorkoutBubbleComponent } from "@shared/design-system/workout-bubble/infrastructure/components/workout-bubble.component";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ActiveWorkoutService } from "@gym/training/workout/application/services/active-workout.service";
import { ActiveWorkoutBannerVisibilityService } from "@gym/training/workout/application/services/active-workout-banner-visibility.service";

@Component({
  selector: "app-active-workout-banner",
  templateUrl: "./active-workout-banner.component.html",
  styleUrls: ["./active-workout-banner.component.css"],
  imports: [ContextualTranslatePipe, WorkoutBubbleComponent],
})
export class ActiveWorkoutBannerComponent implements OnInit {
  protected activeWorkout = inject(ActiveWorkoutService);
  private bannerVisibility = inject(ActiveWorkoutBannerVisibilityService);
  private authSessionService = inject(AuthSessionService);
  private router = inject(Router);

  readonly visible = this.bannerVisibility.visible;

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
