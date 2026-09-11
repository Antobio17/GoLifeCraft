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
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ChipComponent } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { MetaItemComponent } from "@shared/design-system/meta-item/infrastructure/components/meta-item.component";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";
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
import { TicketRow } from "../../domain/models/ticket-row.model";
import { TicketStatus } from "../../domain/models/ticket-status.model";

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
    CardComponent,
    HeadingComponent,
    TextComponent,
    ChipComponent,
    SelectComponent,
    SearchInputComponent,
    MetaItemComponent,
    ProgressBarComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    SkeletonFiltersComponent,
    InfiniteScrollComponent,
  ],
})
export class GetTicketsComponent extends AbstractListPageComponent<Ticket> {
  private static readonly PAGE_SIZE = 20;

  private getTicketsService = inject(GetTicketsService);
  private ticketView = inject(TicketViewService);

  protected readonly modulePath = "nutrition/shopping/ticket";
  protected readonly storageKey = "pageSize_tickets";
  protected override readonly appendsPages = true;

  selectedStatus = signal("");
  search = signal("");

  reloading = signal(false);
  loadingMore = signal(false);

  statusOptions = computed<SelectOption[]>(() => [
    {
      value: TicketStatus.DRAFT,
      label: this.t(this.ticketView.statusKey(TicketStatus.DRAFT)),
    },
    {
      value: TicketStatus.RECEIVED,
      label: this.t(this.ticketView.statusKey(TicketStatus.RECEIVED)),
    },
  ]);

  hasMore = computed(() => this.items().length < this.totalItems());

  headerSubtitle = computed(
    () => `${this.totalItems()} ${this.t("getTickets.stats.tickets")}`,
  );

  rows = computed<TicketRow[]>(() =>
    this.items().map((ticket) =>
      this.ticketView.rowOf(
        ticket.id,
        ticket.attributes,
        (key) => this.t(key),
        (key, params) => this.count(key, params),
      ),
    ),
  );

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(GetTicketsComponent.PAGE_SIZE);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Ticket>> {
    return this.getTicketsService.getTickets(
      page,
      pageSize,
      this.selectedStatus() || undefined,
      this.search() || undefined,
    );
  }

  protected override captureFilters(): Record<string, string> {
    return { status: this.selectedStatus(), search: this.search() };
  }

  protected override restoreFilters(filters: Record<string, string>): void {
    this.selectedStatus.set(filters["status"] ?? "");
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
}
