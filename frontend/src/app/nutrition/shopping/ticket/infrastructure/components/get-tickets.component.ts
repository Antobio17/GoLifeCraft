import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Observable } from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { ViewSwitchComponent } from "@shared/design-system/view-switch/infrastructure/components/view-switch.component";
import { ViewSwitchOption } from "@shared/design-system/view-switch/domain/models/view-switch-option.model";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { ModuleCardComponent } from "@shared/design-system/module-card/infrastructure/components/module-card.component";
import { ProgressRingComponent } from "@shared/design-system/progress-ring/infrastructure/components/progress-ring.component";
import { StatStripComponent } from "@shared/design-system/stat-strip/infrastructure/components/stat-strip.component";
import { ActionTileComponent } from "@shared/design-system/action-tile/infrastructure/components/action-tile.component";
import { SectionHeaderComponent } from "@shared/design-system/section-header/infrastructure/components/section-header.component";
import { DatedRowComponent } from "@shared/design-system/dated-row/infrastructure/components/dated-row.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonFiltersComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-filters.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetTicketsService } from "@nutrition/shopping/ticket/application/services/get-tickets.service";
import { TicketViewService } from "@nutrition/shopping/ticket/application/services/ticket-view.service";
import { Ticket } from "../../domain/models/ticket.model";
import { TicketMonthGroup } from "../../domain/models/ticket-month-group.model";
import { TicketMonthSummary } from "../../domain/models/ticket-month-summary.model";
import { TicketHero } from "../../domain/models/ticket-hero.model";
import { TicketQuickAccess } from "../../domain/models/ticket-quick-access.model";
import { TicketStatusFilter } from "../../domain/models/ticket-status-filter.model";

import { BackNavigationService } from "@shared/routing/application/services/back-navigation.service";
@Component({
  selector: "app-get-tickets",
  templateUrl: "./get-tickets.component.html",
  imports: [
    NgTemplateOutlet,
    FormsModule,
    RevealDirective,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    StackComponent,
    GridComponent,
    HeadingComponent,
    TextComponent,
    ButtonComponent,
    ViewSwitchComponent,
    SearchInputComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    SkeletonFiltersComponent,
    InfiniteScrollComponent,
    SplitViewComponent,
    ModuleCardComponent,
    ProgressRingComponent,
    StatStripComponent,
    ActionTileComponent,
    SectionHeaderComponent,
    DatedRowComponent,
    SkeletonComponent,
  ],
})
export class GetTicketsComponent extends AbstractListPageComponent<Ticket> {
  private backNavigation = inject(BackNavigationService);
  private static readonly PAGE_SIZE = 20;

  private getTicketsService = inject(GetTicketsService);
  private ticketView = inject(TicketViewService);

  protected readonly modulePath = "nutrition/shopping/ticket";
  protected readonly storageKey = "pageSize_tickets";
  protected override readonly appendsPages = true;

  private static readonly MONTH_PAGE_SIZE = 100;

  selectedStatus = signal<string>(TicketStatusFilter.ALL);
  search = signal("");

  reloading = signal(false);
  loadingMore = signal(false);
  monthLoading = signal(true);
  monthTickets = signal<Ticket[]>([]);

  private readonly today = new Date();

  statusOptions = computed<ViewSwitchOption[]>(() => [
    {
      value: TicketStatusFilter.ALL,
      label: this.t("getTickets.filter.all"),
    },
    {
      value: TicketStatusFilter.DRAFT,
      label: this.t("getTickets.filter.draft"),
    },
    {
      value: TicketStatusFilter.RECEIVED,
      label: this.t("getTickets.filter.received"),
    },
  ]);

  filtered = computed(
    () =>
      TicketStatusFilter.ALL !== this.selectedStatus() || "" !== this.search(),
  );

  hasMore = computed(() => this.items().length < this.totalItems());

  headerSubtitle = computed(() =>
    this.count("getTickets.stats.tickets", { count: this.totalItems() }),
  );

  summary = computed<TicketMonthSummary>(() =>
    this.ticketView.monthSummary(this.monthTickets(), this.today),
  );

  hero = computed<TicketHero>(() => {
    const summary = this.summary();
    const locale = this.translationService.getLocale();

    return {
      title: this.ticketView.monthTitle(summary.purchasedOn, locale),
      caption:
        summary.tickets > 0
          ? this.count("getTickets.hero.caption", {
              linked: summary.linkedItems,
              total: summary.totalItems,
            })
          : this.t("getTickets.hero.emptyText"),
      percent: this.ticketView.progressPercent(
        summary.linkedItems,
        summary.totalItems,
      ),
      pendingTicketId: summary.pendingTicketId,
      tickets: summary.tickets,
      stats: [
        {
          value: this.ticketView.money(summary.spent),
          label: this.t("getTickets.hero.spent"),
        },
        {
          value: `${summary.tickets}`,
          label: this.t("getTickets.hero.tickets"),
        },
        {
          value: `${summary.pendingItems}`,
          label: this.t("getTickets.hero.pending"),
        },
      ],
    };
  });

  heroCtaLabel = computed(() =>
    this.hero().pendingTicketId
      ? this.t("getTickets.hero.link")
      : this.t("getTickets.scan"),
  );

  tiles = computed<TicketQuickAccess>(() => ({
    shopping: this.t("getTickets.tiles.shopping"),
    shoppingMeta: this.t("getTickets.tiles.shoppingMeta"),
    inventory: this.t("getTickets.tiles.inventory"),
    inventoryMeta: this.t("getTickets.tiles.inventoryMeta"),
    catalog: this.t("getTickets.tiles.catalog"),
    catalogMeta: this.t("getTickets.tiles.catalogMeta"),
  }));

  months = computed<TicketMonthGroup[]>(() => {
    const locale = this.translationService.getLocale();

    return this.items()
      .reduce<{ key: string; purchasedOn: string; tickets: Ticket[] }[]>(
        (groups, ticket) => {
          const key = this.ticketView.monthKey(ticket.attributes.purchasedOn);
          const last = groups[groups.length - 1];

          if (last?.key === key) {
            last.tickets.push(ticket);
            return groups;
          }

          return [
            ...groups,
            {
              key,
              purchasedOn: ticket.attributes.purchasedOn,
              tickets: [ticket],
            },
          ];
        },
        [],
      )
      .map((group) => ({
        key: group.key,
        title: this.ticketView.monthTitle(group.purchasedOn, locale),
        countLabel: this.count("getTickets.stats.tickets", {
          count: group.tickets.length,
        }),
        rows: group.tickets.map((ticket) =>
          this.ticketView.rowOf(
            ticket.id,
            ticket.attributes,
            locale,
            (key) => this.t(key),
            (key, params) => this.count(key, params),
          ),
        ),
      }));
  });

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(GetTicketsComponent.PAGE_SIZE);
    this.loadMonth();
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Ticket>> {
    return this.getTicketsService.getTickets(
      page,
      pageSize,
      this.statusFilter(),
      this.search() || undefined,
    );
  }

  protected override captureFilters(): Record<string, string> {
    return { status: this.selectedStatus(), search: this.search() };
  }

  protected override restoreFilters(filters: Record<string, string>): void {
    this.selectedStatus.set(filters["status"] || TicketStatusFilter.ALL);
    this.search.set(filters["search"] ?? "");
  }

  loadMore(): void {
    if (
      this.loading() ||
      this.loadingMore() ||
      this.reloading() ||
      !this.hasMore()
    )
      return;

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

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.reload();
  }

  onSearch(needle: string): void {
    this.search.set(needle);
    this.reload();
  }

  onOpen(id: string): void {
    this.router.navigate(["/tickets", id]);
  }

  onScan(): void {
    this.router.navigate(["/tickets", "scan"]);
  }

  onHeroCta(): void {
    const pendingTicketId = this.hero().pendingTicketId;

    if (!pendingTicketId) {
      this.onScan();
      return;
    }

    this.onOpen(pendingTicketId);
  }

  onShopping(): void {
    this.router.navigate(["/shopping-list"]);
  }

  onInventory(): void {
    this.router.navigate(["/inventory"]);
  }

  onCatalog(): void {
    this.router.navigate(["/catalog"]);
  }

  private statusFilter(): string | undefined {
    if (TicketStatusFilter.ALL === this.selectedStatus()) return undefined;

    return this.selectedStatus();
  }

  private loadMonth(): void {
    this.monthLoading.set(true);

    this.getTicketsService
      .getTickets(1, GetTicketsComponent.MONTH_PAGE_SIZE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.monthTickets.set(response.data);
          this.monthLoading.set(false);
        },
        error: () => this.monthLoading.set(false),
      });
  }

  private reload(): void {
    this.currentPage.set(1);
    this.reloading.set(true);

    this.fetch(1, this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.totalItems.set(response.meta.total);
          this.reloading.set(false);
        },
        error: () => this.reloading.set(false),
      });
  }

  private count(key: string, params: Record<string, unknown>): string {
    return this.translationService.translate(key, this.modulePath, params);
  }

  goBack(): void {
    this.backNavigation.back(["/inventory"]);
  }
}
