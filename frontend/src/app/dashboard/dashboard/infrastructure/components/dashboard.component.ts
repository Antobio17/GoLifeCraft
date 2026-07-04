import { Component, computed, inject } from "@angular/core";
import { DatePipe, DecimalPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { FloatingToastService } from "@shared/shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";

interface DailySummary {
  consumedKcal: number;
  targetKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  imports: [DatePipe, DecimalPipe, RouterLink, ContextualTranslatePipe],
})
export class DashboardComponent {
  private authSessionService = inject(AuthSessionService);
  private floatingToastService = inject(FloatingToastService);

  readonly today = new Date();

  readonly name = computed(
    () => this.authSessionService.session()?.username ?? "",
  );

  readonly initial = computed(() => {
    const value = this.name().trim();
    return value ? value.charAt(0).toUpperCase() : "?";
  });

  readonly summary: DailySummary = {
    consumedKcal: 1480,
    targetKcal: 2100,
    proteinG: 82,
    fatG: 54,
    carbsG: 160,
  };

  get progressPercent(): number {
    return Math.min(
      100,
      Math.round((this.summary.consumedKcal / this.summary.targetKcal) * 100),
    );
  }

  comingSoon(): void {
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "dashboard.comingSoon",
      details: [],
    });
  }
}
