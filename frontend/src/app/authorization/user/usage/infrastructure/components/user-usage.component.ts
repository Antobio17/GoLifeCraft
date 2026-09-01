import { Component, computed, inject, input, signal } from "@angular/core";
import { toObservable, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { BarChartBar } from "@shared/design-system/bar-chart/domain/models/bar-chart-bar.model";
import { BarChartComponent } from "@shared/design-system/bar-chart/infrastructure/components/bar-chart.component";
import { LineChartComponent } from "@shared/design-system/line-chart/infrastructure/components/line-chart.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { MeterComponent } from "@shared/design-system/meter/infrastructure/components/meter.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { PanelComponent } from "@shared/design-system/panel/infrastructure/components/panel.component";
import { ReadonlyStripComponent } from "@shared/design-system/readonly-strip/infrastructure/components/readonly-strip.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { SkeletonMetricsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-metrics.component";
import { SkeletonPanelComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-panel.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { StatTileComponent } from "@shared/design-system/stat-tile/infrastructure/components/stat-tile.component";
import { GetUserUsageService } from "../../application/services/get-user-usage.service";
import { GetUserUsageProvider } from "../providers/get-user-usage.provider";
import { UserUsage } from "../../domain/models/user-usage.model";
import { UserUsageMetricTile } from "../../domain/models/user-usage-metric-tile.model";
import { UserUsageModuleShare } from "../../domain/models/user-usage-module-share.model";

const MODULE_COLORS: Record<string, string> = {
  nutrition: "var(--ds-data-1)",
  gym: "var(--ds-data-2)",
  agenda: "var(--ds-data-3)",
  finance: "var(--ds-accent)",
};

const CAPTION_EVERY = 7;

@Component({
  selector: "app-user-usage",
  templateUrl: "./user-usage.component.html",
  providers: [...GetUserUsageProvider.getProviders()],
  imports: [
    ContextualTranslatePipe,
    BarChartComponent,
    LineChartComponent,
    EmptyStateComponent,
    GridComponent,
    MeterComponent,
    NoteComponent,
    PanelComponent,
    ReadonlyStripComponent,
    SectionHeaderComponent,
    SkeletonMetricsComponent,
    SkeletonPanelComponent,
    StackComponent,
    StatTileComponent,
  ],
})
export class UserUsageComponent {
  private getUserUsageService = inject(GetUserUsageService);
  private translationService = inject(TranslationService);

  private readonly MODULE_PATH = "authorization/user/usage";

  readonly userId = input.required<string>();

  loading = signal(true);
  failed = signal(false);
  usage = signal<UserUsage | null>(null);

  readonly provisioned = computed(() => this.usage()?.provisioned === true);

  readonly hasData = computed(() => {
    const usage = this.usage();
    if (!usage?.provisioned) return false;

    return usage.totalRecords > 0 || usage.totalEvents > 0;
  });

  readonly totalRecordsLabel = computed(() =>
    this.number(this.usage()?.totalRecords ?? 0),
  );

  readonly totalEventsLabel = computed(() =>
    this.number(this.usage()?.totalEvents ?? 0),
  );

  readonly completedWorkoutsLabel = computed(() =>
    this.number(this.metricValue("completedWorkouts")),
  );

  readonly recentEventsLabel = computed(() =>
    this.number(
      (this.usage()?.dailyActivity ?? []).reduce(
        (total, day) => total + day.events,
        0,
      ),
    ),
  );

  readonly lastWorkoutLabel = computed(() =>
    this.dateTime(this.usage()?.lastWorkoutAt),
  );

  readonly lastActivityLabel = computed(() =>
    this.dateTime(this.usage()?.lastActivityAt),
  );

  readonly firstActivityLabel = computed(() =>
    this.dateTime(this.usage()?.firstActivityAt),
  );

  readonly moduleShares = computed<UserUsageModuleShare[]>(() => {
    const modules = this.usage()?.modules ?? [];
    const total = modules.reduce((sum, item) => sum + item.records, 0);

    return modules.map((item) => ({
      module: item.module,
      label: this.t(`userUsage.module.${item.module}`),
      records: item.records,
      percent: total === 0 ? 0 : Math.round((item.records / total) * 100),
      color: MODULE_COLORS[item.module] ?? "var(--ds-data-1)",
      lastActivityLabel: this.date(item.lastActivityAt),
    }));
  });

  readonly metricTiles = computed<UserUsageMetricTile[]>(() =>
    (this.usage()?.metrics ?? [])
      .filter((metric) => metric.metric !== "completedWorkouts")
      .map((metric) => ({
        metric: metric.metric,
        label: this.t(`userUsage.metric.${metric.metric}`),
        value: metric.value,
      })),
  );

  readonly monthlyBars = computed<BarChartBar[]>(() => {
    const months = this.usage()?.monthlyActivity ?? [];

    return months.map((item, index) => ({
      label: this.monthLabel(item.month),
      value: item.events,
      valueLabel: this.number(item.events),
      selected: index === months.length - 1,
    }));
  });

  readonly dailyPoints = computed<number[]>(() =>
    (this.usage()?.dailyActivity ?? []).map((day) => day.events),
  );

  readonly dailyCaptions = computed<string[]>(() =>
    (this.usage()?.dailyActivity ?? []).map((day, index) =>
      index % CAPTION_EVERY === 0 ? this.dayLabel(day.date) : "",
    ),
  );

  constructor() {
    toObservable(this.userId)
      .pipe(
        switchMap((userId) => {
          this.loading.set(true);
          this.failed.set(false);

          return this.getUserUsageService.getUserUsage(userId).pipe(
            catchError(() => {
              this.failed.set(true);

              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((usage) => {
        this.usage.set(usage);
        this.loading.set(false);
      });

    this.translationService.loadModuleTranslations(this.MODULE_PATH);
  }

  private metricValue(metric: string): number {
    return (
      (this.usage()?.metrics ?? []).find((item) => item.metric === metric)
        ?.value ?? 0
    );
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  private number(value: number): string {
    return new Intl.NumberFormat(this.translationService.getLocale(), {
      maximumFractionDigits: 0,
    }).format(value);
  }

  private date(value: string | null | undefined): string {
    if (!value) return this.t("userUsage.never");

    return new Date(value).toLocaleDateString(
      this.translationService.getLocale(),
      { day: "2-digit", month: "short", year: "numeric" },
    );
  }

  private dateTime(value: string | null | undefined): string {
    if (!value) return this.t("userUsage.never");

    return new Date(value).toLocaleString(this.translationService.getLocale(), {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private monthLabel(month: string): string {
    const [year, index] = month.split("-").map(Number);

    return new Intl.DateTimeFormat(this.translationService.getLocale(), {
      month: "narrow",
    }).format(new Date(year, index - 1, 1));
  }

  private dayLabel(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    return new Intl.DateTimeFormat(this.translationService.getLocale(), {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(year, month - 1, day));
  }
}
