import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable } from "rxjs";
import { GetSessionsService } from "@gym/training/session/application/services/get-sessions.service";
import { SessionRotationService } from "@gym/training/session/application/services/session-rotation.service";
import { GetWorkoutsService } from "@gym/training/workout/application/services/get-workouts.service";
import { GetGymStatsService } from "@gym/analytics/stats/application/services/get-gym-stats.service";
import { TrainingCalendarService } from "@gym/analytics/stats/application/services/training-calendar.service";
import { GymStats } from "@gym/analytics/stats/domain/models/gym-stats.model";
import { CalendarDay } from "@gym/analytics/stats/domain/models/calendar-day.model";
import { Workout } from "@gym/training/workout/domain/models/workout.model";
import { Session } from "../../domain/models/session.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { ActionTileComponent } from "@shared/design-system/action-tile/infrastructure/components/action-tile.component";
import { StatTileComponent } from "@shared/design-system/stat-tile/infrastructure/components/stat-tile.component";
import { WeekStripComponent } from "@shared/design-system/week-strip/infrastructure/components/week-strip.component";
import { WeekStripDay } from "@shared/design-system/week-strip/domain/models/week-strip-day.model";
import { WeekStripDayState } from "@shared/design-system/week-strip/domain/models/week-strip-day-state.enum";
import { NextSessionCardComponent } from "@shared/design-system/next-session-card/infrastructure/components/next-session-card.component";
import { SessionRowComponent } from "@shared/design-system/session-row/infrastructure/components/session-row.component";
import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";

interface SessionRow {
  id: string;
  name: string;
  badge: string;
  meta: string;
  muscles: string;
  lastLabel: string;
  startAriaLabel: string;
}

interface NextSessionView {
  id: string;
  eyebrow: string;
  title: string;
  caption: string;
  stats: StatStripItem[];
  tags: string[];
  openAriaLabel: string;
}

interface MonthStatView {
  value: string;
  unit: string;
  label: string;
  note: string;
  positive: boolean;
}

const WEEK_DAYS = 7;
const MONTH_DAYS = 30;
const RECENT_WORKOUTS = 60;
const MAX_TAGS = 4;
const KG_PER_TONNE = 1000;

@Component({
  selector: "app-get-sessions",
  templateUrl: "./get-sessions.component.html",
  imports: [
    RevealDirective,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    GridComponent,
    SplitViewComponent,
    ButtonComponent,
    EmptyStateComponent,
    SkeletonComponent,
    SkeletonListComponent,
    SectionHeaderComponent,
    ActionTileComponent,
    StatTileComponent,
    WeekStripComponent,
    NextSessionCardComponent,
    SessionRowComponent,
  ],
})
export class GetSessionsComponent extends AbstractListPageComponent<Session> {
  private getSessionsService = inject(GetSessionsService);
  private getWorkoutsService = inject(GetWorkoutsService);
  private getGymStatsService = inject(GetGymStatsService);
  private rotation = inject(SessionRotationService);
  private calendar = inject(TrainingCalendarService);

  protected readonly modulePath = "gym/training/session";
  protected readonly storageKey = "pageSize_sessions";

  workouts = signal<Workout[]>([]);
  workoutsTotal = signal(0);
  stats = signal<GymStats | null>(null);
  statsLoading = signal(true);

  private lastWorkouts = computed(() =>
    this.rotation.lastWorkoutBySession(this.workouts()),
  );

  private nextSession = computed(() =>
    this.rotation.sessionForToday(
      this.items(),
      this.workouts(),
      this.lastWorkouts(),
    ),
  );

  next = computed<NextSessionView | null>(() => {
    const session = this.nextSession();
    if (!session) {
      return null;
    }

    const attributes = session.attributes;
    const lastWorkout = this.lastWorkouts().get(session.id);

    return {
      id: session.id,
      eyebrow: this.tp(
        lastWorkout
          ? "getSessions.next.eyebrow"
          : "getSessions.next.eyebrowFirst",
      ),
      title: attributes.name,
      caption: lastWorkout
        ? this.tp("getSessions.next.lastDone", {
            when: this.whenLabel(lastWorkout.attributes.startedAt, false),
            volume: this.number(lastWorkout.attributes.volumeKg),
          })
        : this.tp("getSessions.next.neverDone"),
      stats: [
        {
          value: `${attributes.exerciseCount}`,
          label: this.tp("getSessions.next.exercises"),
        },
        {
          value: `${attributes.setCount}`,
          label: this.tp("getSessions.next.sets"),
        },
        {
          value: `~${attributes.estimatedDurationMinutes}`,
          label: this.tp("getSessions.next.minutes"),
        },
      ],
      tags: attributes.muscleGroups.slice(0, MAX_TAGS),
      openAriaLabel: this.tp("getSessions.next.open", {
        name: attributes.name,
      }),
    };
  });

  sessionCountLabel = computed(() =>
    this.loading() ? "" : `${this.totalItems()}`,
  );


  rows = computed<SessionRow[]>(() => {
    const nextId = this.nextSession()?.id ?? null;
    const lastWorkouts = this.lastWorkouts();

    return this.items().map((session) => {
      const attributes = session.attributes;
      const lastWorkout = lastWorkouts.get(session.id);

      return {
        id: session.id,
        name: attributes.name,
        badge: session.id === nextId ? this.tp("getSessions.row.today") : "",
        meta: this.tp("getSessions.row.meta", {
          exercises: attributes.exerciseCount,
          sets: attributes.setCount,
          minutes: attributes.estimatedDurationMinutes,
        }),
        muscles: attributes.muscleGroups.join(" · "),
        lastLabel: lastWorkout
          ? this.whenLabel(lastWorkout.attributes.startedAt, true)
          : "",
        startAriaLabel: this.tp("getSessions.row.start", {
          name: attributes.name,
        }),
      };
    });
  });

  private trainingDays = computed(() => this.stats()?.trainingDays ?? []);

  private recentDays = computed<CalendarDay[]>(() =>
    this.calendar.lastDays(this.trainingDays(), WEEK_DAYS),
  );

  weekDays = computed<WeekStripDay[]>(() => {
    const weekday = new Intl.DateTimeFormat(this.locale(), {
      weekday: "narrow",
    });
    const longDate = new Intl.DateTimeFormat(this.locale(), {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return this.recentDays().map((day) => {
      const state = this.dayState(day);

      return {
        key: day.iso,
        weekday: weekday.format(day.date),
        day: `${day.date.getDate()}`,
        state,
        ariaLabel: `${longDate.format(day.date)}: ${this.tp(`getSessions.week.${state}`)}`,
      };
    });
  });

  weekTitle = computed(() => this.tp("getSessions.week.title"));

  weekCaption = computed(() => {
    const days = this.recentDays();
    const workouts = days.reduce((total, day) => total + day.workouts, 0);

    if (workouts === 0) {
      return this.tp("getSessions.week.captionEmpty");
    }

    return this.tp("getSessions.week.caption", {
      count: workouts,
      volume: this.number(days.reduce((total, day) => total + day.volumeKg, 0)),
    });
  });

  streakLabel = computed(() => {
    const weeks = this.calendar.streakWeeks(this.trainingDays());

    if (weeks === 0) {
      return "";
    }

    return weeks === 1
      ? this.tp("getSessions.week.streakOne")
      : this.tp("getSessions.week.streak", { count: weeks });
  });

  tiles = computed(() => ({
    free: this.tp("getSessions.tiles.free"),
    freeMeta: this.tp("getSessions.tiles.freeMeta"),
    history: this.tp("getSessions.tiles.history"),
    historyMeta: this.tp("getSessions.tiles.historyMeta", {
      count: this.workoutsTotal(),
    }),
    library: this.tp("getSessions.tiles.library"),
    libraryMeta: this.tp("getSessions.tiles.libraryMeta", {
      count: this.stats()?.totalExercises ?? 0,
    }),
  }));

  monthTitle = computed(() => this.tp("getSessions.month.title"));

  monthStats = computed<MonthStatView[]>(() => {
    const today = new Date();
    const periodStart = this.calendar.shift(today, -(MONTH_DAYS - 1));
    const current = this.calendar.totals(
      this.trainingDays(),
      periodStart,
      today,
    );
    const previous = this.calendar.totals(
      this.trainingDays(),
      this.calendar.shift(periodStart, -MONTH_DAYS),
      this.calendar.shift(periodStart, -1),
    );
    const workoutsDelta = current.workouts - previous.workouts;
    const volumeDelta =
      previous.volumeKg > 0
        ? Math.round(
            ((current.volumeKg - previous.volumeKg) / previous.volumeKg) * 100,
          )
        : null;

    return [
      {
        value: `${current.workouts}`,
        unit: "",
        label: this.tp("getSessions.month.workouts"),
        note: this.tp("getSessions.month.workoutsDelta", {
          delta: this.signed(workoutsDelta),
        }),
        positive: workoutsDelta > 0,
      },
      {
        value: this.number(current.volumeKg / KG_PER_TONNE, 1),
        unit: "t",
        label: this.tp("getSessions.month.volume"),
        note:
          volumeDelta === null
            ? ""
            : this.tp("getSessions.month.volumeDelta", {
                delta: this.signed(volumeDelta),
              }),
        positive: (volumeDelta ?? 0) > 0,
      },
      {
        value: this.number(current.minutes / 60, 1),
        unit: "h",
        label: this.tp("getSessions.month.time"),
        note:
          current.workouts > 0
            ? this.tp("getSessions.month.average", {
                minutes: Math.round(current.minutes / current.workouts),
              })
            : "",
        positive: false,
      },
    ];
  });

  constructor() {
    super();
    this.loadWorkouts();
    this.loadStats();
  }

  protected configureList(): void {
    this.pageSize.set(100);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Session>> {
    return this.getSessionsService.getSessions(page, pageSize);
  }

  private loadWorkouts(): void {
    this.getWorkoutsService
      .getWorkouts(1, RECENT_WORKOUTS)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response) => {
          this.workouts.set(response.data);
          this.workoutsTotal.set(response.meta.total);
        },
        error: () => {},
      });
  }

  private loadStats(): void {
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

  private dayState(day: CalendarDay): WeekStripDayState {
    if (day.workouts > 0) {
      return WeekStripDayState.Done;
    }

    return day.isToday ? WeekStripDayState.Today : WeekStripDayState.Rest;
  }

  private whenLabel(startedAt: string, short: boolean): string {
    const days = this.calendar.daysBetween(
      new Date(startedAt.replace(" ", "T")),
      new Date(),
    );
    const keys = short
      ? { today: "shortToday", yesterday: "shortYesterday", days: "short" }
      : { today: "today", yesterday: "yesterday", days: "days" };

    if (days <= 0) {
      return this.tp(`getSessions.when.${keys.today}`);
    }

    if (days === 1) {
      return this.tp(`getSessions.when.${keys.yesterday}`);
    }

    return this.tp(`getSessions.when.${keys.days}`, { count: days });
  }

  private signed(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
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

  onOpen(id: string): void {
    this.router.navigate(["/gym/sessions", id]);
  }

  onCreate(): void {
    this.router.navigate(["/gym/sessions", "create"]);
  }

  onLibrary(): void {
    this.router.navigate(["/gym/exercises"]);
  }

  onHistory(): void {
    this.router.navigate(["/gym/history"]);
  }

  onFreeWorkout(): void {
    this.router.navigate(["/gym/free"]);
  }

  onStart(id: string): void {
    this.router.navigate(["/gym/sessions", id], {
      queryParams: { start: 1 },
    });
  }
}
