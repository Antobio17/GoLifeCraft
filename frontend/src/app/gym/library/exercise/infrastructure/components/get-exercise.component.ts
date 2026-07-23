import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { forkJoin } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { GetExerciseService } from "../../application/services/get-exercise.service";
import { GetExerciseStatsService } from "../../application/services/get-exercise-stats.service";
import { Exercise } from "../../domain/models/exercise.model";
import {
  ExerciseStats,
  ExerciseStatsSession,
} from "../../domain/models/exercise-stats.model";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import {
  SegmentedToggleComponent,
  SegmentedOption,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { MetricCardComponent } from "@shared/design-system/metric-card/infrastructure/components/metric-card.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import {
  ProgressionCardComponent,
  ProgressionTrend,
} from "@shared/design-system/progression-card/infrastructure/components/progression-card.component";

type MetricKey = "e1rm" | "max" | "vol";

interface SessionRow {
  dateLabel: string;
  valueLabel: string;
  setsText: string;
  isPr: boolean;
}

@Component({
  selector: "app-get-exercise",
  templateUrl: "./get-exercise.component.html",
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SegmentedToggleComponent,
    StackComponent,
    GridComponent,
    CardComponent,
    TextComponent,
    HeadingComponent,
    ChipComponent,
    MetricCardComponent,
    IconButtonComponent,
    EmptyStateComponent,
    SkeletonComponent,
    ProgressionCardComponent,
  ],
})
export class GetExerciseComponent implements OnInit {
  private static readonly MODULE_PATH = "gym/library/exercise";
  private static readonly MAX_CHART_POINTS = 8;

  private translationService = inject(TranslationService);
  private getExerciseService = inject(GetExerciseService);
  private getExerciseStatsService = inject(GetExerciseStatsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  private readonly dateFormatter = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
  });

  private id = "";

  loading = signal(true);
  exercise = signal<Exercise | null>(null);
  sessions = signal<ExerciseStatsSession[]>([]);
  metric = signal<MetricKey>("e1rm");

  metricOptions = computed<SegmentedOption[]>(() => [
    { value: "e1rm", label: this.t("getExercise.metric.e1rm") },
    { value: "max", label: this.t("getExercise.metric.max") },
    { value: "vol", label: this.t("getExercise.metric.vol") },
  ]);

  muscles = computed<string[]>(
    () => this.exercise()?.attributes.muscleGroups ?? [],
  );

  modeLabel = computed<string>(() => {
    const exercise = this.exercise();
    if (!exercise) return "";
    return this.t(`getExercise.mode.${exercise.attributes.type.toLowerCase()}`);
  });

  hasData = computed<boolean>(() => this.sessions().length > 0);

  timesDone = computed<number>(() => this.sessions().length);

  bestE1rm = computed<string>(() => {
    const sessions = this.sessions();
    if (sessions.length === 0) return "—";
    const best = Math.max(...sessions.map((s) => s.estimatedOneRepMaxKg));
    return `${this.round(best)} kg`;
  });

  lastLabel = computed<string>(() => {
    const sessions = this.sessions();
    if (sessions.length === 0) return "—";
    return this.formatDate(sessions[sessions.length - 1].date);
  });

  metricName = computed<string>(() =>
    this.t(`getExercise.metricName.${this.metric()}`),
  );

  private metricValues = computed<number[]>(() =>
    this.sessions().map((session) => this.valueOf(session)),
  );

  private visibleSessions = computed<ExerciseStatsSession[]>(() =>
    this.sessions().slice(-GetExerciseComponent.MAX_CHART_POINTS),
  );

  private visibleValues = computed<number[]>(() =>
    this.visibleSessions().map((session) => this.valueOf(session)),
  );

  chartPoints = computed<number[]>(() => this.visibleValues());

  chartLabels = computed<string[]>(() =>
    this.visibleValues().map((value) => `${this.round(value)}`),
  );

  currentLabel = computed<string>(() => {
    const values = this.metricValues();
    return `${this.round(values.length ? values[values.length - 1] : 0)} kg`;
  });

  prValue = computed<number>(() => {
    const values = this.metricValues();
    return values.length ? Math.max(...values) : 0;
  });

  prLabel = computed<string>(() => `PR ${this.round(this.prValue())} kg`);

  private deltaPercent = computed<number | null>(() => {
    const values = this.visibleValues();
    if (values.length < 2 || values[0] <= 0) return null;
    return Math.round(
      ((values[values.length - 1] - values[0]) / values[0]) * 100,
    );
  });

  deltaLabel = computed<string | null>(() => {
    const delta = this.deltaPercent();
    if (delta === null) return null;
    return `${delta > 0 ? "+" : ""}${delta}%`;
  });

  deltaTrend = computed<ProgressionTrend>(() => {
    const delta = this.deltaPercent();
    if (delta === null || delta === 0) return "neutral";
    return delta > 0 ? "up" : "down";
  });

  firstDateLabel = computed<string>(() => {
    const sessions = this.visibleSessions();
    return sessions.length ? this.formatDate(sessions[0].date) : "";
  });

  lastDateLabel = computed<string>(() => {
    const sessions = this.visibleSessions();
    return sessions.length
      ? this.formatDate(sessions[sessions.length - 1].date)
      : "";
  });

  sessionRows = computed<SessionRow[]>(() => {
    const pr = this.prValue();
    return this.sessions()
      .map((session) => {
        const value = this.valueOf(session);
        return {
          dateLabel: this.formatDate(session.date),
          valueLabel: `${this.round(value)} kg`,
          setsText: session.sets
            .map((set) => `${set.reps} × ${set.weightKg}kg`)
            .join("   "),
          isPr: value === pr && pr > 0,
        };
      })
      .reverse();
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id") ?? "";

    forkJoin({
      exercise: this.getExerciseService.getExercise(this.id),
      stats: this.getExerciseStatsService.getExerciseStats(this.id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ exercise, stats }) => {
          this.exercise.set(exercise.data);
          this.sessions.set(this.sortByDate(stats));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  goBack(): void {
    this.router.navigate(["/gym/exercises"]);
  }

  onEdit(): void {
    this.router.navigate(["/gym/exercises", this.id, "edit"]);
  }

  onMetricChange(metric: MetricKey): void {
    this.metric.set(metric);
  }

  private sortByDate(stats: ExerciseStats): ExerciseStatsSession[] {
    return [...stats.sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  private valueOf(session: ExerciseStatsSession): number {
    if (this.metric() === "max") return session.maxWeightKg;
    if (this.metric() === "vol") return session.volumeKg;
    return session.estimatedOneRepMaxKg;
  }

  private round(value: number): number {
    return Math.round(value);
  }

  private formatDate(value: string): string {
    return this.dateFormatter.format(new Date(value.replace(" ", "T")));
  }

  private t(key: string): string {
    return this.translationService.translate(
      key,
      GetExerciseComponent.MODULE_PATH,
    );
  }
}
