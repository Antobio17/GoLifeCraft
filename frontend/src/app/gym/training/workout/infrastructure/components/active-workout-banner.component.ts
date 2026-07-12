import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ActiveWorkoutService } from "@gym/training/workout/application/services/active-workout.service";

@Component({
  selector: "app-active-workout-banner",
  standalone: true,
  templateUrl: "./active-workout-banner.component.html",
  styleUrls: ["./active-workout-banner.component.css"],
  imports: [ContextualTranslatePipe, ConfirmActionModalComponent],
})
export class ActiveWorkoutBannerComponent implements OnInit {
  protected activeWorkout = inject(ActiveWorkoutService);
  private authSessionService = inject(AuthSessionService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  private readonly currentPath = signal(this.pathOf(this.router.url));

  showStopModal = signal(false);
  stopping = signal(false);

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

  requestStop(): void {
    this.showStopModal.set(true);
  }

  onConfirmStop(): void {
    this.stopping.set(true);
    this.activeWorkout.discard().subscribe({
      next: () => {
        this.stopping.set(false);
        this.showStopModal.set(false);
        this.floatingToastService.showToast({
          status: 200,
          keyTranslation: "workout.banner.stopModal.toast",
          details: [],
        });
      },
      error: () => {
        this.stopping.set(false);
        this.showStopModal.set(false);
      },
    });
  }

  onCancelStop(): void {
    this.showStopModal.set(false);
  }
}
