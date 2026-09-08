import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgTemplateOutlet } from "@angular/common";
import { Observable } from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { LocationCardComponent } from "@shared/design-system/location-card/infrastructure/components/location-card.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonFiltersComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-filters.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetPantryLocationsService } from "@nutrition/pantry/location/application/services/get-pantry-locations.service";
import { PantryLocation } from "../../domain/models/pantry-location.model";
import { PantryLocationRow } from "../../domain/models/pantry-location-row.model";

@Component({
  selector: "app-get-pantry-locations",
  templateUrl: "./get-pantry-locations.component.html",
  imports: [
    NgTemplateOutlet,
    RevealDirective,
    ContextualTranslatePipe,
    PageWrapperComponent,
    ScreenHeaderComponent,
    SearchInputComponent,
    GridComponent,
    TextComponent,
    ButtonComponent,
    LocationCardComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    SkeletonFiltersComponent,
    InfiniteScrollComponent,
  ],
})
export class GetPantryLocationsComponent extends AbstractListPageComponent<PantryLocation> {
  private static readonly PAGE_SIZE = 20;

  private getPantryLocationsService = inject(GetPantryLocationsService);

  protected readonly modulePath = "nutrition/pantry/location";
  protected readonly storageKey = "pageSize_pantryLocations";
  protected override readonly appendsPages = true;

  searchQuery = signal("");

  reloading = signal(false);
  loadingMore = signal(false);

  hasMore = computed(() => this.items().length < this.totalItems());

  headerSubtitle = computed(
    () =>
      `${this.totalItems()} ${this.t("getPantryLocations.stats.locations")}`,
  );

  rows = computed<PantryLocationRow[]>(() =>
    this.items().map((location) => this.toRow(location)),
  );

  protected configureList(): void {
    this.currentPage.set(1);
    this.pageSize.set(GetPantryLocationsComponent.PAGE_SIZE);
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<PantryLocation>> {
    return this.getPantryLocationsService.getPantryLocations(
      page,
      pageSize,
      this.searchQuery().trim() || undefined,
    );
  }

  protected override captureFilters(): Record<string, string> {
    return { search: this.searchQuery() };
  }

  protected override restoreFilters(filters: Record<string, string>): void {
    this.searchQuery.set(filters["search"] ?? "");
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

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.reload();
  }

  onCreate(): void {
    this.router.navigate(["/locations", "create"]);
  }

  onOpen(id: string): void {
    this.router.navigate(["/locations", id]);
  }

  back(): void {
    this.router.navigate(["/inventory"]);
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

  private toRow(location: PantryLocation): PantryLocationRow {
    const { name, emoji, description, articleCount, recipeCount } =
      location.attributes;

    return {
      id: location.id,
      name,
      emoji,
      description,
      badges: [
        {
          label: `${articleCount}`,
          value: this.t("getPantryLocations.card.articles"),
        },
        {
          label: `${recipeCount}`,
          value: this.t("getPantryLocations.card.recipes"),
        },
      ],
    };
  }
}
