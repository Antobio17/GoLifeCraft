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
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { AgendaItemComponent } from "@shared/design-system/agenda-item/infrastructure/components/agenda-item.component";
import { GetAgendaDayService } from "@agenda/agenda/agenda/application/services/get-agenda-day.service";
import { AgendaViewService } from "@agenda/agenda/agenda/application/services/agenda-view.service";
import { AgendaCategoryCatalogService } from "@agenda/agenda/agenda/application/services/agenda-category-catalog.service";
import {
  AgendaDayAttributes,
  AgendaEntryView,
} from "@agenda/agenda/agenda/domain/models/agenda.model";

const VISIBLE_ENTRIES = 3;

@Component({
  selector: "app-agenda-summary",
  templateUrl: "./agenda-summary.component.html",
  imports: [
    ContextualTranslatePipe,
    StackComponent,
    TextComponent,
    SkeletonComponent,
    SectionHeaderComponent,
    AgendaItemComponent,
  ],
})
export class AgendaSummaryComponent implements OnInit {
  private authSession = inject(AuthSessionService);
  private getAgendaDayService = inject(GetAgendaDayService);
  private view = inject(AgendaViewService);
  private categoryCatalog = inject(AgendaCategoryCatalogService);

  readonly seeAll = output<void>();

  canWrite = this.authSession.isGod();

  loading = signal(true);
  day = signal<AgendaDayAttributes | null>(null);

  entries = computed(() => this.day()?.entries ?? []);
  hasEntries = computed(() => this.entries().length > 0);
  visibleEntries = computed(() => this.entries().slice(0, VISIBLE_ENTRIES));
  hiddenCount = computed(() =>
    Math.max(0, this.entries().length - VISIBLE_ENTRIES),
  );
  pendingCount = computed(() => this.day()?.pendingCount ?? 0);

  ngOnInit(): void {
    this.getAgendaDayService.getAgendaDay(this.view.todayIso()).subscribe({
      next: (response) => {
        this.day.set(response.data.attributes);
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
}
