import { Component, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgTemplateOutlet } from "@angular/common";
import { Observable } from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { ScreenHeaderComponent } from "@shared/design-system/screen-header/infrastructure/components/screen-header.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { GridComponent } from "@shared/design-system/grid/infrastructure/components/grid.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { PressableComponent } from "@shared/design-system/pressable/infrastructure/components/pressable.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { MetaItemComponent } from "@shared/design-system/meta-item/infrastructure/components/meta-item.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { SkeletonFiltersComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-filters.component";
import { InfiniteScrollComponent } from "@shared/design-system/infinite-scroll/infrastructure/components/infinite-scroll.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import { RevealDirective } from "@shared/design-system/reveal/infrastructure/directives/reveal.directive";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetPantryLocationsService } from "@nutrition/pantry/location/application/services/get-pantry-locations.service";
import { DeletePantryLocationService } from "@nutrition/pantry/location/application/services/delete-pantry-location.service";
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
    StackComponent,
    GridComponent,
    CardComponent,
    HeadingComponent,
    TextComponent,
    ButtonComponent,
    IconButtonComponent,
    PressableComponent,
    EmojiTileComponent,
    MetaItemComponent,
    EmptyStateComponent,
    SkeletonListComponent,
    SkeletonFiltersComponent,
    InfiniteScrollComponent,
    ConfirmActionModalComponent,
  ],
})
export class GetPantryLocationsComponent extends AbstractListPageComponent<PantryLocation> {
  private static readonly PAGE_SIZE = 20;

  private getPantryLocationsService = inject(GetPantryLocationsService);
  private deletePantryLocationService = inject(DeletePantryLocationService);

  protected readonly modulePath = "nutrition/pantry/location";
  protected readonly storageKey = "pageSize_pantryLocations";
  protected override readonly appendsPages = true;

  searchQuery = signal("");

  reloading = signal(false);
  loadingMore = signal(false);

  showDeleteModal = signal(false);
  deleting = signal(false);
  locationToDelete = signal<PantryLocation | null>(null);

  locationToDeleteName = computed(
    () => this.locationToDelete()?.attributes.name ?? "",
  );

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

  onEdit(id: string): void {
    this.router.navigate(["/locations", id, "edit"]);
  }

  onDelete(location: PantryLocation): void {
    this.locationToDelete.set(location);
    this.showDeleteModal.set(true);
  }

  onCancelDelete(): void {
    this.showDeleteModal.set(false);
    this.locationToDelete.set(null);
  }

  onConfirmDelete(): void {
    const location = this.locationToDelete();

    if (null === location) return;

    this.deleting.set(true);

    this.deletePantryLocationService
      .deletePantryLocation(location.id)
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.showDeleteModal.set(false);
          this.locationToDelete.set(null);
          this.reload();
        },
        error: () => {
          this.deleting.set(false);
          this.showDeleteModal.set(false);
        },
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

  private toRow(location: PantryLocation): PantryLocationRow {
    const { name, emoji, description, articleCount, recipeCount } =
      location.attributes;

    return {
      location,
      id: location.id,
      name,
      emoji,
      description,
      articlesLabel: `${articleCount} ${this.t("getPantryLocations.card.articles")}`,
      recipesLabel: `${recipeCount} ${this.t("getPantryLocations.card.recipes")}`,
    };
  }
}
