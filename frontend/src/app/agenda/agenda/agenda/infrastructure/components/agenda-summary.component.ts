import {
  Component,
  OnInit,
  computed,
  inject,
  output,
  signal,
} from "@angular/core";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
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
import {
  AgendaEntryView,
  AgendaUpcomingAttributes,
} from "@agenda/agenda/agenda/domain/models/agenda.model";

const UPCOMING_DAYS = 7;
const VISIBLE_ENTRIES = 4;

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
  private authSession = inject(AuthSessionService);
  private getAgendaUpcomingService = inject(GetAgendaUpcomingService);
  private view = inject(AgendaViewService);
  private categoryCatalog = inject(AgendaCategoryCatalogService);

  readonly seeAll = output<void>();

  canWrite = computed(() => this.authSession.isGod());

  loading = signal(true);
  upcoming = signal<AgendaUpcomingAttributes | null>(null);

  entries = computed(() => this.upcoming()?.entries ?? []);
  hasEntries = computed(() => this.entries().length > 0);
  visibleEntries = computed(() => this.entries().slice(0, VISIBLE_ENTRIES));
  hiddenCount = computed(() =>
    Math.max(0, this.entries().length - VISIBLE_ENTRIES),
  );
  pendingCount = computed(() => this.upcoming()?.pendingCount ?? 0);

  ngOnInit(): void {
    this.getAgendaUpcomingService
      .getAgendaUpcoming(this.view.todayIso(), UPCOMING_DAYS)
      .subscribe({
        next: (response) => {
          this.upcoming.set(response.data.attributes);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  entryKindLabel(entry: AgendaEntryView, fallback: string): string {
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
}
