import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable } from "rxjs";
import { GetWorkoutsService } from "@gym/training/workout/application/services/get-workouts.service";
import { WorkoutWeekGroupingService } from "@gym/training/workout/application/services/workout-week-grouping.service";
import { GetGymStatsService } from "@gym/analytics/stats/application/services/get-gym-stats.service";
import { TrainingCalendarService } from "@gym/analytics/stats/application/services/training-calendar.service";
import { GymStats } from "@gym/analytics/stats/domain/models/gym-stats.model";
import {
  Workout,
  WorkoutListAttributes,
} from "../../domain/models/workout.model";
import { WorkoutRowView } from "../../domain/models/workout-row-view.model";
import { WorkoutWeekView } from "../../domain/models/workout-week-view.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { MonthHeatmapComponent } from "@shared/design-system/month-heatmap/infrastructure/components/month-heatmap.component";
import { MonthHeatmapCell } from "@shared/design-system/month-heatmap/domain/models/month-heatmap-cell.model";
import { StatStripComponent } from "@shared/design-system/stat-strip/infrastructure/components/stat-strip.component";
import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";
import { DatedRowComponent } from "@shared/design-system/dated-row/infrastructure/components/dated-row.component";
import { DatedRowTone } from "@shared/design-system/dated-row/domain/models/dated-row-tone.enum";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

const KG_PER_TONNE = 1000;
const FIRST_MONDAY = new Date(2024, 0, 1);

@Component({
  selector: "app-get-workouts",
  templateUrl: "./get-workouts.component.html",
  imports: [
    RevealDirective,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    CardComponent,
    EmptyStateComponent,
    SkeletonComponent,
    SkeletonListComponent,
    InfiniteScrollComponent,
    SectionHeaderComponent,
    MonthHeatmapComponent,
    StatStripComponent,
    DatedRowComponent,
  ],
})
export class GetWorkoutsComponent extends AbstractListPageComponent<Workout> {
  private static readonly PAGE_SIZE = 20;

  private getWorkoutsService = inject(GetWorkoutsService);
  private getGymStatsService = inject(GetGymStatsService);
  private calendar = inject(TrainingCalendarService);
  private grouping = inject(WorkoutWeekGroupingService);
  private backNavigation = inject(BackNavigationService);

  protected readonly modulePath = "gym/training/workout";
  protected readonly storageKey = "pageSize_workouts";
  protected override readonly appendsPages = true;

  loadingMore = signal(false);
  stats = signal<GymStats | null>(null);
  statsLoading = signal(true);
  month = signal(this.monthStart(new Date()));

  hasMore = computed(() => this.items().length < this.totalItems());

  headerSubtitle = computed(
    () => `${this.totalItems()} ${this.t("getWorkouts.subtitle")}`,
  );

  private trainingDays = computed(() => this.stats()?.trainingDays ?? []);

  monthTitle = computed(() =>
    new Intl.DateTimeFormat(this.locale(), {
      month: "long",
      year: "numeric",
    }).format(this.month()),
  );

  weekdayLabels = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.locale(), {
      weekday: "narrow",
    });

    return Array.from({ length: 7 }, (_, offset) =>
      formatter.format(this.calendar.shift(FIRST_MONDAY, offset)),
    );
  });

  monthCells = computed<MonthHeatmapCell[]>(() => {
    const month = this.month();
    const dateLabel = new Intl.DateTimeFormat(this.locale(), {
      day: "numeric",
      month: "long",
    });

    return this.calendar
      .monthGrid(this.trainingDays(), month.getFullYear(), month.getMonth())
      .map((day, index) => {
        if (!day) {
          return {
            key: `blank-${index}`,
            label: "",
            level: 0,
            isToday: false,
            ariaLabel: "",
          };
        }

        const date = dateLabel.format(day.date);

        return {
          key: day.iso,
          label: `${day.date.getDate()}`,
          level: day.level,
          isToday: day.isToday,
          ariaLabel:
            day.workouts > 0
              ? this.tp("getWorkouts.month.day", { date, count: day.workouts })
              : this.tp("getWorkouts.month.dayEmpty", { date }),
        };
      });
  });

  monthStats = computed<StatStripItem[]>(() => {
    const month = this.month();
    const totals = this.calendar.totals(
      this.trainingDays(),
      month,
      new Date(month.getFullYear(), month.getMonth() + 1, 0),
    );

    return [
      {
        value: `${totals.workouts}`,
        label: this.tp("getWorkouts.month.workouts"),
      },
      {
        value: this.number(totals.volumeKg / KG_PER_TONNE, 1),
        unit: "t",
        label: this.tp("getWorkouts.month.volume"),
      },
      {
        value: this.number(totals.minutes / 60, 1),
        unit: "h",
        label: this.tp("getWorkouts.month.time"),
      },
    ];
  });

  canPreviousMonth = computed(() => {
    const first = this.calendar.firstMonth(this.trainingDays());

    return first !== null && this.month() > first;
  });

  canNextMonth = computed(() => this.month() < this.monthStart(new Date()));

  weeks = computed<WorkoutWeekView[]>(() =>
    this.grouping.group(this.items()).map((group) => {
      const volumeKg = group.workouts.reduce(
        (total, workout) => total + workout.attributes.volumeKg,
        0,
      );

      return {
        key: group.key,
        title: this.weekTitle(group.weekStart),
        summary: this.tp("getWorkouts.week.summary", {
          count: group.workouts.length,
          volume: this.number(volumeKg / KG_PER_TONNE, 1),
        }),
        rows: group.workouts.map((workout) => this.row(workout)),
      };
    }),
  );

  constructor() {
    super();
    this.getGymStatsService
      .getGymStats()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.statsLoading.set(false);
        },
        error: () => this.statsLoading.set(false),
      });
  }

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(GetWorkoutsComponent.PAGE_SIZE);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Workout>> {
    return this.getWorkoutsService.getWorkouts(page, pageSize);
  }

  loadMore(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) return;

    const nextPage = this.currentPage() + 1;
    this.loadingMore.set(true);

    this.fetch(nextPage, this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.currentPage.set(nextPage);
          this.items.update((current) => [...current, ...response.data]);
          this.totalItems.set(response.meta.total);
          this.loadingMore.set(false);
        },
        error: () => this.loadingMore.set(false),
      });
  }

  onPreviousMonth(): void {
    const month = this.month();
    this.month.set(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  }

  onNextMonth(): void {
    const month = this.month();
    this.month.set(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  }

  private row(workout: Workout): WorkoutRowView {
    const attributes = workout.attributes;
    const startedAt = this.grouping.startedAt(attributes.startedAt);
    const complete =
      attributes.totalSets > 0 &&
      attributes.completedSets === attributes.totalSets;

    return {
      id: workout.id,
      weekday: new Intl.DateTimeFormat(this.locale(), { weekday: "short" })
        .format(startedAt)
        .replace(".", ""),
      day: `${startedAt.getDate()}`,
      title: attributes.sessionName,
      tag: attributes.sessionId ? "" : this.tp("getWorkouts.free"),
      duration: this.durationText(attributes.durationSeconds),
      meta: this.metaText(attributes),
      ratio: `${attributes.completedSets}/${attributes.totalSets}`,
      ratioTone: complete ? DatedRowTone.Success : DatedRowTone.Warning,
      progress: this.progressPercent(attributes),
      ariaLabel: this.tp("getWorkouts.row.open", {
        name: attributes.sessionName,
        date: new Intl.DateTimeFormat(this.locale(), {
          day: "numeric",
          month: "long",
        }).format(startedAt),
      }),
    };
  }

  private weekTitle(weekStart: Date): string {
    const weeksAgo = this.grouping.weeksAgo(weekStart);

    if (weeksAgo === 0) {
      return this.tp("getWorkouts.week.current");
    }

    if (weeksAgo === 1) {
      return this.tp("getWorkouts.week.previous");
    }

    const weekEnd = this.calendar.shift(weekStart, 6);
    const day = new Intl.DateTimeFormat(this.locale(), { day: "numeric" });
    const dayMonth = new Intl.DateTimeFormat(this.locale(), {
      day: "numeric",
      month: "short",
    });

    return `${day.format(weekStart)} – ${dayMonth.format(weekEnd).replace(".", "")}`;
  }

  private metaText(attributes: WorkoutListAttributes): string {
    const exercises = `${attributes.exerciseCount} ${this.t("getWorkouts.card.exercises")}`;

    if (attributes.volumeKg <= 0) {
      return exercises;
    }

    return `${exercises} · ${this.tp("getWorkouts.volume", {
      volume: this.number(attributes.volumeKg),
    })}`;
  }

  private progressPercent(attributes: WorkoutListAttributes): number {
    if (attributes.totalSets <= 0) {
      return 0;
    }
    return Math.round((attributes.completedSets / attributes.totalSets) * 100);
  }

  private durationText(totalSeconds: number): string {
    const seconds = Math.max(0, totalSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  }

  private monthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private number(value: number, fractionDigits = 0): string {
    return new Intl.NumberFormat(this.locale(), {
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }

  private locale(): string {
    return this.translationService.getLocale();
  }

  private tp(key: string, params?: Record<string, unknown>): string {
    return this.translationService.translate(key, this.modulePath, params);
  }

  goBack(): void {
    this.backNavigation.back(["/gym"]);
  }

  onOpen(id: string): void {
    this.router.navigate(["/gym/history", id]);
  }
}
