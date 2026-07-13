import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { DatePipe, DecimalPipe } from "@angular/common";
import { Router } from "@angular/router";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ActionTileComponent } from "@shared/design-system/action-tile/infrastructure/components/action-tile.component";
import { DashboardLayoutComponent } from "@shared/design-system/dashboard-layout/infrastructure/components/dashboard-layout.component";
import { GreetingHeaderComponent } from "@shared/design-system/greeting-header/infrastructure/components/greeting-header.component";
import { DailySummaryComponent } from "@shared/design-system/daily-summary/infrastructure/components/daily-summary.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { GetGymStatsService } from "@gym/analytics/stats/application/services/get-gym-stats.service";
import { GymStats } from "@gym/analytics/stats/domain/models/gym-stats.model";
import { GymAnalyticsComponent } from "@gym/analytics/stats/infrastructure/components/gym-analytics.component";

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
  imports: [
    DatePipe,
    DecimalPipe,
    ContextualTranslatePipe,
    ActionTileComponent,
    DashboardLayoutComponent,
    GreetingHeaderComponent,
    DailySummaryComponent,
    SectionHeaderComponent,
    StackComponent,
    GridComponent,
    GymAnalyticsComponent,
  ],
})
export class DashboardComponent implements OnInit {
  private authSessionService = inject(AuthSessionService);
  private floatingToastService = inject(FloatingToastService);
  private getGymStatsService = inject(GetGymStatsService);
  private router = inject(Router);

  readonly today = new Date();

  readonly gymStats = signal<GymStats | null>(null);
  readonly gymStatsLoading = signal(true);

  readonly name = computed(() => {
    const session = this.authSessionService.session();
    const username = session?.user?.username?.trim();
    if (username) return username;

    const email = session?.email ?? "";
    const local = email.split("@")[0] ?? "";
    if (!local) return "";
    return local.charAt(0).toUpperCase() + local.slice(1);
  });

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

  ngOnInit(): void {
    this.getGymStatsService.getGymStats().subscribe({
      next: (stats) => {
        this.gymStats.set(stats);
        this.gymStatsLoading.set(false);
      },
      error: () => this.gymStatsLoading.set(false),
    });
  }

  goToGym(): void {
    this.router.navigate(["/gym"]);
  }

  goToCatalog(): void {
    this.router.navigate(["/catalog"]);
  }

  comingSoon(): void {
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "dashboard.comingSoon",
      details: [],
    });
  }
}
