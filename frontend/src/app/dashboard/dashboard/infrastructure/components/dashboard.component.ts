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
import { MyAvatarService } from "@shared/my-avatar/application/services/my-avatar.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { DashboardLayoutComponent } from "@shared/design-system/dashboard-layout/infrastructure/components/dashboard-layout.component";
import { GreetingHeaderComponent } from "@shared/design-system/greeting-header/infrastructure/components/greeting-header.component";
import { NotificationBellComponent } from "@shared/design-system/notification-bell/infrastructure/components/notification-bell.component";
import { UnreadNotificationsService } from "@notification/notification/inbox/application/services/unread-notifications.service";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { CalorieSummaryComponent } from "@shared/design-system/calorie-summary/infrastructure/components/calorie-summary.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { LinkRowComponent } from "@shared/design-system/link-row/infrastructure/components/link-row.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GetGymStatsService } from "@gym/analytics/stats/application/services/get-gym-stats.service";
import { GymStats } from "@gym/analytics/stats/domain/models/gym-stats.model";
import { GymAnalyticsComponent } from "@gym/analytics/stats/infrastructure/components/gym-analytics.component";
import { GetDiaryService } from "@nutrition/diary/diary/application/services/get-diary.service";
import { DiaryViewService } from "@nutrition/diary/diary/application/services/diary-view.service";
import { DiaryDayAttributes } from "@nutrition/diary/diary/domain/models/diary.model";
import { AgendaSummaryComponent } from "@agenda/agenda/agenda/infrastructure/components/agenda-summary.component";
import { FinanceSavingsSummaryComponent } from "@economy/finance/budget/infrastructure/components/finance-savings-summary.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  imports: [
    DatePipe,
    ContextualTranslatePipe,
    DashboardLayoutComponent,
    GreetingHeaderComponent,
    NotificationBellComponent,
    SkeletonLineComponent,
    CalorieSummaryComponent,
    SectionHeaderComponent,
    ModuleCardComponent,
    LinkRowComponent,
    StackComponent,
    GymAnalyticsComponent,
    AgendaSummaryComponent,
    FinanceSavingsSummaryComponent,
  ],
})
export class DashboardComponent implements OnInit {
  protected view = inject(DiaryViewService);

  private authSessionService = inject(AuthSessionService);
  private myAvatarService = inject(MyAvatarService);
  private unreadNotificationsService = inject(UnreadNotificationsService);
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

  readonly avatarUrl = this.myAvatarService.url;
  readonly unreadNotifications = this.unreadNotificationsService.count;

  readonly summary = signal<DiaryDayAttributes | null>(null);

  readonly summaryCard = computed(() => {
    const diary = this.summary();
    if (!diary) return null;

    return this.view.summaryCard(diary);
  });

  readonly headlineKey = computed(() => {
    const diary = this.summary();
    if (!diary) return "";
    if (diary.entryCount === 0) return "dashboard.headline.empty";
    if (this.view.exceedsCalories(diary)) return "dashboard.headline.over";

    return "dashboard.headline.under";
  });

  readonly headlineKcal = computed(() => {
    const diary = this.summary();
    if (!diary) return "";

    return this.view.integer(
      Math.abs(diary.consumedCalories - diary.goalCalories),
    );
  });

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

  goToNotifications(): void {
    this.router.navigate(["/notifications"]);
  }

  goToGym(): void {
    this.router.navigate(["/gym"]);
  }

  goToAgenda(): void {
    this.router.navigate(["/agenda"]);
  }

  goToNewAgendaEntry(): void {
    this.router.navigate(["/agenda"], { queryParams: { create: 1 } });
  }

  goToNewMovement(): void {
    this.router.navigate(["/economy"], { queryParams: { create: 1 } });
  }

  goToBudget(): void {
    this.router.navigate(["/economy/budget"]);
  }

  goToDiary(): void {
    this.router.navigate(["/diary"]);
  }

  goToShopping(): void {
    this.router.navigate(["/shopping-list"]);
  }
}
