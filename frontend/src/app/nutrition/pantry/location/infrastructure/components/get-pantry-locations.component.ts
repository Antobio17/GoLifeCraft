import { Component, computed, inject, signal } from "@angular/core";
import { Observable } from "rxjs";
import { SkeletonPageHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-page-header.component";
import { PaginationComponent } from "@shared/design-system/pagination/infrastructure/components/pagination.component";
import { ListTableComponent } from "@shared/design-system/list-table/infrastructure/components/list-table.component";
import {
  ListAction,
  ListActionEvent,
  ListCellClickEvent,
  ListColumn,
} from "@shared/design-system/list-table/domain/models/list-table.model";
import { ListFiltersComponent } from "@shared/design-system/list-filters/infrastructure/components/list-filters.component";
import { FilterField } from "@shared/design-system/list-filters/domain/models/list-filters.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { PageHeaderComponent } from "@shared/design-system/page-header/infrastructure/components/page-header.component";
import { ConfirmActionModalComponent } from "@shared/design-system/confirm-action-modal/infrastructure/components/confirm-action-modal.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetPantryLocationsService } from "@nutrition/pantry/location/application/services/get-pantry-locations.service";
import { DeletePantryLocationService } from "@nutrition/pantry/location/application/services/delete-pantry-location.service";
import { PantryLocation } from "../../domain/models/pantry-location.model";

@Component({
  selector: "app-get-pantry-locations",
  templateUrl: "./get-pantry-locations.component.html",
  imports: [
    PaginationComponent,
    ListTableComponent,
    ListFiltersComponent,
    ContextualTranslatePipe,
    ButtonComponent,
    SkeletonPageHeaderComponent,
    PageWrapperComponent,
    PageHeaderComponent,
    ConfirmActionModalComponent,
  ],
})
export class GetPantryLocationsComponent extends AbstractListPageComponent<PantryLocation> {
  private getPantryLocationsService = inject(GetPantryLocationsService);
  private deletePantryLocationService = inject(DeletePantryLocationService);

  protected readonly modulePath = "nutrition/pantry/location";
  protected readonly storageKey = "pageSize_pantryLocations";

  filterName = "";

  showDeleteModal = signal(false);
  deleting = signal(false);
  locationToDelete = signal<PantryLocation | null>(null);

  locationToDeleteName = computed(
    () => this.locationToDelete()?.attributes.name ?? "",
  );

  filterFields = computed<FilterField[]>(() => [
    {
      key: "name",
      label: this.t("getPantryLocations.filter.name"),
      type: "text",
      placeholder: this.t("getPantryLocations.filter.namePlaceholder"),
    },
  ]);

  columns = computed<ListColumn<PantryLocation>[]>(() => [
    {
      key: "name",
      label: this.t("getPantryLocations.table.name"),
      value: (item) =>
        `${item.attributes.emoji} ${item.attributes.name}`.trim(),
      width: "1.4fr",
      minWidth: "200px",
      cardPrimary: true,
      link: () => true,
    },
    {
      key: "description",
      label: this.t("getPantryLocations.table.description"),
      value: (item) => item.attributes.description,
      width: "1.6fr",
      minWidth: "200px",
    },
    {
      key: "content",
      label: this.t("getPantryLocations.table.content"),
      value: (item) =>
        `${item.attributes.articleCount} · ${item.attributes.recipeCount}`,
      width: "0.8fr",
      minWidth: "120px",
      cardLabel: this.t("getPantryLocations.table.contentCard"),
    },
  ]);

  actions = computed<ListAction<PantryLocation>[]>(() => [
    {
      key: "view",
      label: this.t("getPantryLocations.actions.view"),
      icon: "view",
    },
    {
      key: "edit",
      label: this.t("getPantryLocations.actions.edit"),
      icon: "edit",
    },
    {
      key: "delete",
      label: this.t("getPantryLocations.actions.delete"),
      icon: "delete",
      danger: true,
    },
  ]);

  protected configureList(): void {}

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<PantryLocation>> {
    return this.getPantryLocationsService.getPantryLocations(
      page,
      pageSize,
      this.filterName || undefined,
    );
  }

  protected override applyFilters(
    values: Record<string, string | boolean>,
  ): void {
    this.filterName = (values["name"] as string) || "";
  }

  protected override clearFilters(): void {
    this.filterName = "";
  }

  protected override captureFilters(): Record<string, string> {
    return { name: this.filterName };
  }

  protected override restoreFilters(filters: Record<string, string>): void {
    this.filterName = filters["name"] ?? "";
  }

  onCreate(): void {
    this.router.navigate(["/locations", "create"]);
  }

  onCell({ row }: ListCellClickEvent<PantryLocation>): void {
    this.router.navigate(["/locations", row.id]);
  }

  onAction({ key, row }: ListActionEvent<PantryLocation>): void {
    if (key === "view") {
      this.router.navigate(["/locations", row.id]);
      return;
    }

    if (key === "edit") {
      this.router.navigate(["/locations", row.id, "edit"]);
      return;
    }

    this.locationToDelete.set(row);
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
          this.load();
        },
        error: () => {
          this.deleting.set(false);
          this.showDeleteModal.set(false);
        },
      });
  }
}
