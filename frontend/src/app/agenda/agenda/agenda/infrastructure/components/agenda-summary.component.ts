import {
  Component,
  OnInit,
  computed,
  inject,
  output,
  signal,
} from "@angular/core";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { AgendaItemComponent } from "@shared/design-system/agenda-item/infrastructure/components/agenda-item.component";
import { GetAgendaUpcomingService } from "@agenda/agenda/agenda/application/services/get-agenda-upcoming.service";
import { AgendaViewService } from "@agenda/agenda/agenda/application/services/agenda-view.service";
import { AgendaCategoryCatalogService } from "@agenda/agenda/agenda/application/services/agenda-category-catalog.service";
import { GetAgendaSeriesService } from "@agenda/agenda/agenda/application/services/get-agenda-series.service";
import {
  AgendaEntryView,
  AgendaUpcomingAttributes,
} from "@agenda/agenda/agenda/domain/models/agenda.model";
import { AgendaSeriesAttributes } from "@agenda/agenda/agenda/domain/models/agenda-series.model";

const UPCOMING_DAYS = 7;
const VISIBLE_ENTRIES = 4;

interface AgendaSummaryEntry {
  id: string;
  entry: AgendaEntryView;
  title: string;
  kind: AgendaEntryView["kind"];
  category: string;
  notes: string;
  done: boolean;
  appointment: boolean;
  timeLabel: string | null;
}

@Component({
  selector: "app-agenda-summary",
  templateUrl: "./agenda-summary.component.html",
  imports: [
    ContextualTranslatePipe,
    StackComponent,
    TextComponent,
    SkeletonLineComponent,
    SkeletonListComponent,
    SectionHeaderComponent,
    AgendaItemComponent,
  ],
})
export class AgendaSummaryComponent implements OnInit {
  private getAgendaUpcomingService = inject(GetAgendaUpcomingService);
  private getAgendaSeriesService = inject(GetAgendaSeriesService);
  private view = inject(AgendaViewService);
  private categoryCatalog = inject(AgendaCategoryCatalogService);

  readonly seeAll = output<void>();

  loading = signal(true);
  upcoming = signal<AgendaUpcomingAttributes | null>(null);
  summaryEntries = signal<AgendaSummaryEntry[]>([]);

  hasEntries = computed(() => this.summaryEntries().length > 0);
  visibleEntries = computed(() =>
    this.summaryEntries().slice(0, VISIBLE_ENTRIES),
  );
  hiddenCount = computed(() =>
    Math.max(0, this.summaryEntries().length - VISIBLE_ENTRIES),
  );
  pendingCount = computed(() => this.upcoming()?.pendingCount ?? 0);

  ngOnInit(): void {
    this.getAgendaUpcomingService
      .getAgendaUpcoming(this.view.todayIso(), UPCOMING_DAYS)
      .pipe(
        switchMap((response) =>
          this.buildSummaryEntries(response.data.attributes.entries).pipe(
            map((entries) => ({
              upcoming: response.data.attributes,
              entries,
            })),
          ),
        ),
      )
      .subscribe({
        next: ({ upcoming, entries }) => {
          this.upcoming.set(upcoming);
          this.summaryEntries.set(entries);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  entryKindLabel(entry: AgendaSummaryEntry, fallback: string): string {
    return this.categoryCatalog.badgeLabel(
      entry.kind,
      entry.category,
      fallback,
    );
  }

  entryWhenLabel(
    entry: AgendaEntryView,
    todayLabel: string,
    tomorrowLabel: string,
  ): string {
    return this.view.whenLabel(entry, todayLabel, tomorrowLabel);
  }

  private buildSummaryEntries(
    entries: AgendaEntryView[],
  ): Observable<AgendaSummaryEntry[]> {
    const seriesIds = new Set<string>();

    for (const entry of entries) {
      if (!entry.seriesId) continue;

      seriesIds.add(entry.seriesId);
    }

    if (seriesIds.size === 0) {
      return of(entries.map((entry) => this.toEntrySummary(entry)));
    }

    return forkJoin(
      [...seriesIds].map((seriesId) =>
        this.getAgendaSeriesService.getAgendaSeries(seriesId).pipe(
          map((response) => ({
            seriesId,
            series: response.data.attributes,
          })),
          catchError(() => of(null)),
        ),
      ),
    ).pipe(
      map((seriesEntries) => this.groupSummaryEntries(entries, seriesEntries)),
    );
  }

  private groupSummaryEntries(
    entries: AgendaEntryView[],
    seriesEntries: Array<{
      seriesId: string;
      series: AgendaSeriesAttributes;
    } | null>,
  ): AgendaSummaryEntry[] {
    const seriesById = new Map<string, AgendaSeriesAttributes>();

    for (const seriesEntry of seriesEntries) {
      if (!seriesEntry) continue;

      seriesById.set(seriesEntry.seriesId, seriesEntry.series);
    }

    const seenSeries = new Set<string>();
    const summaryEntries: AgendaSummaryEntry[] = [];

    for (const entry of entries) {
      if (!entry.seriesId) {
        summaryEntries.push(this.toEntrySummary(entry));
        continue;
      }

      if (seenSeries.has(entry.seriesId)) continue;

      seenSeries.add(entry.seriesId);

      const series = seriesById.get(entry.seriesId);
      if (!series) {
        summaryEntries.push(this.toEntrySummary(entry));
        continue;
      }

      summaryEntries.push(this.toSeriesSummary(entry, series));
    }

    return summaryEntries;
  }

  private toEntrySummary(entry: AgendaEntryView): AgendaSummaryEntry {
    return {
      id: entry.id,
      entry,
      title: entry.title,
      kind: entry.kind,
      category: entry.category,
      notes: entry.notes,
      done: entry.done,
      appointment: entry.kind === "appointment",
      timeLabel: null,
    };
  }

  private toSeriesSummary(
    entry: AgendaEntryView,
    series: AgendaSeriesAttributes,
  ): AgendaSummaryEntry {
    return {
      id: series.seriesId,
      entry,
      title: series.title,
      kind: series.kind,
      category: series.category,
      notes: series.notes,
      done: series.doneCount === series.entryCount,
      appointment: series.kind === "appointment",
      timeLabel: this.view.dateRangeLabel(series.entryDate, series.endDate),
    };
  }
}
