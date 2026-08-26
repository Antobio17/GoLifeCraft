import { Injectable, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter, map } from "rxjs/operators";
import { ActiveWorkoutService } from "@gym/training/workout/application/services/active-workout.service";

@Injectable({ providedIn: "root" })
export class ActiveWorkoutBannerVisibilityService {
  private router = inject(Router);
  private activeWorkout = inject(ActiveWorkoutService);

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => this.pathOf(event.urlAfterRedirects)),
    ),
    { initialValue: this.pathOf(this.router.url) },
  );

  readonly workoutPath = computed(() => {
    const sessionId = this.activeWorkout.activeSessionId();

    if (!sessionId) {
      return "/gym/free";
    }

    return `/gym/sessions/${sessionId}`;
  });

  readonly visible = computed(() => {
    if (!this.activeWorkout.isActive()) {
      return false;
    }

    return this.currentPath() !== this.workoutPath();
  });

  private pathOf(url: string): string {
    return url.split("?")[0];
  }
}
