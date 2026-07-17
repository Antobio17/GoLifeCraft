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
import { GetDiaryService } from "@nutrition/diary/diary/application/services/get-diary.service";

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
  private getDiaryService = inject(GetDiaryService);
  private getGymStatsService = inject(GetGymStatsService);
  private router = inject(Router);

  readonly today = new Date();

  readonly gymStats = signal<GymStats | null>(null);
  readonly gymStatsLoading = signal(true);

  readonly name = computed(() => {
    const session = this.authSessionService.session();
    const name = session?.user?.name?.trim();
    if (name) return name;

    const email = session?.email ?? "";
    const local = email.split("@")[0] ?? "";
    if (!local) return "";
    return local.charAt(0).toUpperCase() + local.slice(1);
  });

  readonly initial = computed(() => {
    const value = this.name().trim();
    return value ? value.charAt(0).toUpperCase() : "?";
  });

  readonly summary = signal<DailySummary>({
    consumedKcal: 0,
    targetKcal: 0,
    proteinG: 0,
    fatG: 0,
    carbsG: 0,
  });

  get progressPercent(): number {
    const summary = this.summary();

    if (summary.targetKcal <= 0) return 0;

    return Math.min(
      100,
      Math.round((summary.consumedKcal / summary.targetKcal) * 100),
    );
  }

  ngOnInit(): void {
    this.getDiaryService.getDiary().subscribe({
      next: (response) => {
        const attributes = response.data.attributes;

        this.summary.set({
          consumedKcal: attributes.consumedCalories,
          targetKcal: attributes.goalCalories,
          proteinG: attributes.totals.protein,
          fatG: attributes.totals.fat,
          carbsG: attributes.totals.carbs,
        });
      },
    });

    this.getGymStatsService.getGymStats().subscribe({
      next: (stats) => {
        this.gymStats.set(stats);
        this.gymStatsLoading.set(false);
      },
      error: () => this.gymStatsLoading.set(false),
    });
  }

  goToSettings(): void {
    this.router.navigate(["/me"]);
  }

  goToGym(): void {
    this.router.navigate(["/gym"]);
  }

  goToCatalog(): void {
    this.router.navigate(["/catalog"]);
  }

  goToRecipes(): void {
    this.router.navigate(["/recipes"]);
  }

  comingSoon(): void {
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "dashboard.comingSoon",
      details: [],
    });
  }
}
