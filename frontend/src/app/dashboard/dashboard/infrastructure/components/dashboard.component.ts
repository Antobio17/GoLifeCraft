import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ActionTileComponent } from "@shared/design-system/action-tile/infrastructure/components/action-tile.component";
import { DashboardLayoutComponent } from "@shared/design-system/dashboard-layout/infrastructure/components/dashboard-layout.component";
import { GreetingHeaderComponent } from "@shared/design-system/greeting-header/infrastructure/components/greeting-header.component";
import { DiarySummaryComponent } from "@shared/design-system/diary-summary/infrastructure/components/diary-summary.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { SkeletonSummaryComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-summary.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { GetGymStatsService } from "@gym/analytics/stats/application/services/get-gym-stats.service";
import { GymStats } from "@gym/analytics/stats/domain/models/gym-stats.model";
import { GymAnalyticsComponent } from "@gym/analytics/stats/infrastructure/components/gym-analytics.component";
import { GetDiaryService } from "@nutrition/diary/diary/application/services/get-diary.service";
import { DiaryViewService } from "@nutrition/diary/diary/application/services/diary-view.service";
import { DiaryDayAttributes } from "@nutrition/diary/diary/domain/models/diary.model";
import { AgendaSummaryComponent } from "@agenda/agenda/agenda/infrastructure/components/agenda-summary.component";
import { FinanceBalanceSummaryComponent } from "@economy/finance/transaction/infrastructure/components/finance-balance-summary.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  imports: [
    DatePipe,
    ContextualTranslatePipe,
    ActionTileComponent,
    DashboardLayoutComponent,
    GreetingHeaderComponent,
    DiarySummaryComponent,
    SectionHeaderComponent,
    SkeletonSummaryComponent,
    StackComponent,
    GridComponent,
    GymAnalyticsComponent,
    AgendaSummaryComponent,
    FinanceBalanceSummaryComponent,
  ],
})
export class DashboardComponent implements OnInit {
  protected view = inject(DiaryViewService);

  private authSessionService = inject(AuthSessionService);
  private getDiaryService = inject(GetDiaryService);
  private getGymStatsService = inject(GetGymStatsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly today = new Date();

  readonly gymStats = signal<GymStats | null>(null);
  readonly gymStatsLoading = signal(true);
  readonly summaryLoading = signal(true);

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

  readonly summary = signal<DiaryDayAttributes | null>(null);

  ngOnInit(): void {
    this.getDiaryService
      .getDiary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.summary.set(response.data.attributes);
          this.summaryLoading.set(false);
        },
        error: () => this.summaryLoading.set(false),
      });

    this.getGymStatsService
      .getGymStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  goToAgenda(): void {
    this.router.navigate(["/agenda"]);
  }

  goToEconomy(): void {
    this.router.navigate(["/economy"]);
  }

  goToCatalog(): void {
    this.router.navigate(["/catalog"]);
  }

  goToDiary(): void {
    this.router.navigate(["/diary"]);
  }

  goToRecipes(): void {
    this.router.navigate(["/recipes"]);
  }

  goToShopping(): void {
    this.router.navigate(["/shopping-list"]);
  }
}
