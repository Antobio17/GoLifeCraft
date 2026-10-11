import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { GetUsersService } from "../../application/services/get-users.service";
import { GetUsersProvider } from "../providers/get-users.provider";
import { UserListItem } from "../../domain/models/get-users-response.model";
import { GetUsersUsageService } from "@authorization/user/usage/application/services/get-users-usage.service";
import { GetUsersUsageProvider } from "@authorization/user/usage/infrastructure/providers/get-users-usage.provider";
import { UserUsageSummary } from "@authorization/user/usage/domain/models/user-usage-summary.model";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonNoteComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-note.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { BigFigureComponent } from "@shared/design-system/big-figure/infrastructure/components/big-figure.component";
import { LineChartComponent } from "@shared/design-system/line-chart/infrastructure/components/line-chart.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { DividerComponent } from "@shared/design-system/divider/infrastructure/components/divider.component";
import { UserActivityRowComponent } from "@shared/design-system/user-activity-row/infrastructure/components/user-activity-row.component";
import { UserActivityStatus } from "@shared/design-system/user-activity-row/domain/models/user-activity-status.enum";
import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";

interface UserRowViewModel {
  id: string;
  initial: string;
  name: string;
  meta: string;
  status: UserActivityStatus;
  modules: string[];
  spark: number[];
  lastActivity: number;
}

const SPARK_DAYS = 14;
const CAPTION_EVERY = 7;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const RELATIVE_STEPS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
  ["week", 4.35],
  ["month", 12],
  ["year", Number.POSITIVE_INFINITY],
];

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  providers: [
    ...GetUsersProvider.getProviders(),
    ...GetUsersUsageProvider.getProviders(),
  ],
  imports: [
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    SplitViewComponent,
    TextComponent,
    SkeletonComponent,
    SkeletonNoteComponent,
    SkeletonLineComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ChipComponent,
    NoteComponent,
    ModuleCardComponent,
    BigFigureComponent,
    LineChartComponent,
    SectionHeaderComponent,
    CardComponent,
    DividerComponent,
    UserActivityRowComponent,
  ],
})
export class UsersComponent implements OnInit {
  private getUsersService = inject(GetUsersService);
  private getUsersUsageService = inject(GetUsersUsageService);
  private backNavigation = inject(BackNavigationService);
  private translationService = inject(TranslationService);
  private router = inject(Router);

  private readonly MODULE_PATH = "authorization/user/user";

  loading = signal(true);
  private users = signal<UserListItem[]>([]);
  private usage = signal<UserUsageSummary[]>([]);

  private readonly usageById = computed(
    () => new Map(this.usage().map((summary) => [summary.id, summary])),
  );

  readonly rows = computed<UserRowViewModel[]>(() =>
    this.users()
      .map((item) => this.toViewModel(item, this.usageById().get(item.id)))
      .sort(
        (a, b) =>
          b.lastActivity - a.lastActivity || a.name.localeCompare(b.name),
      ),
  );

  readonly rowCountLabel = computed(() => `${this.rows().length}`);

  readonly activeThisWeek = computed(() => {
    const since = Date.now() - WEEK_MS;

    return this.usage().filter(
      (summary) =>
        summary.lastActivityAt !== null &&
        new Date(summary.lastActivityAt).getTime() >= since,
    ).length;
  });

  readonly activeOfLabel = computed(() =>
    this.translationService.translate("users.hero.activeOf", this.MODULE_PATH, {
      total: this.users().length,
    }),
  );

  readonly dailyTotals = computed<number[]>(() => {
    const series = this.usage().map((summary) => summary.dailyActivity);
    const length = Math.max(0, ...series.map((days) => days.length));

    return Array.from({ length }, (_, index) =>
      series.reduce((total, days) => total + (days[index]?.events ?? 0), 0),
    );
  });

  readonly dailyCaptions = computed<string[]>(() => {
    const reference =
      this.usage().find((summary) => summary.dailyActivity.length)
        ?.dailyActivity ?? [];

    return reference.map((day, index) =>
      index % CAPTION_EVERY === 0 ? this.dayLabel(day.date) : "",
    );
  });

  readonly eventsLabel = computed(() =>
    this.translationService.translate("users.hero.events", this.MODULE_PATH, {
      events: new Intl.NumberFormat(this.translationService.getLocale()).format(
        this.dailyTotals().reduce((total, events) => total + events, 0),
      ),
    }),
  );

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => this.loadUsers());
  }

  private loadUsers(): void {
    this.loading.set(true);

    forkJoin({
      users: this.getUsersService.getUsers(),
      usage: this.getUsersUsageService
        .getUsersUsage()
        .pipe(catchError(() => of<UserUsageSummary[]>([]))),
    }).subscribe({
      next: ({ users, usage }) => {
        this.users.set(users.data);
        this.usage.set(usage);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private toViewModel(
    item: UserListItem,
    summary: UserUsageSummary | undefined,
  ): UserRowViewModel {
    const attrs = item.attributes;
    const composed = `${attrs.name ?? ""} ${attrs.lastname ?? ""}`.trim();
    const displayName = composed || attrs.username || attrs.email;
    const initialSource = displayName.trim() || attrs.email.trim();
    const status = this.statusOf(attrs.emailVerified, attrs.isActive);
    const lastActivityAt = summary?.lastActivityAt ?? null;

    return {
      id: item.id,
      initial: initialSource ? initialSource.charAt(0).toUpperCase() : "?",
      name: displayName,
      meta: this.metaOf(status, lastActivityAt),
      status,
      modules: summary?.activeModules ?? [],
      spark: (summary?.dailyActivity ?? [])
        .slice(-SPARK_DAYS)
        .map((day) => day.events),
      lastActivity: lastActivityAt ? new Date(lastActivityAt).getTime() : 0,
    };
  }

  private statusOf(verified: boolean, active: boolean): UserActivityStatus {
    if (!verified) return UserActivityStatus.Pending;
    if (!active) return UserActivityStatus.Inactive;

    return UserActivityStatus.Active;
  }

  private metaOf(
    status: UserActivityStatus,
    lastActivityAt: string | null,
  ): string {
    const when = lastActivityAt
      ? this.relativeTime(lastActivityAt)
      : this.t("users.row.never");

    if (status === UserActivityStatus.Pending) {
      return `${this.t("users.row.unverified")} · ${when}`;
    }

    if (status === UserActivityStatus.Inactive) {
      return `${this.t("users.row.inactive")} · ${when}`;
    }

    return when;
  }

  private relativeTime(value: string): string {
    const formatter = new Intl.RelativeTimeFormat(
      this.translationService.getLocale(),
      { numeric: "auto" },
    );
    let amount = (new Date(value).getTime() - Date.now()) / 60000;

    for (const [unit, size] of RELATIVE_STEPS) {
      if (Math.abs(amount) < size) {
        return formatter.format(Math.round(amount), unit);
      }

      amount /= size;
    }

    return formatter.format(Math.round(amount), "year");
  }

  private dayLabel(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    return new Intl.DateTimeFormat(this.translationService.getLocale(), {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(year, month - 1, day));
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  back(): void {
    this.backNavigation.back(["/dashboard"]);
  }

  openUser(row: UserRowViewModel): void {
    this.router.navigate(["/users", row.id]);
  }
}
