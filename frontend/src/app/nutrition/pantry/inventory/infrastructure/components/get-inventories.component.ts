import { Component, computed, inject } from "@angular/core";
import { Observable } from "rxjs";
import { SkeletonPageHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-page-header.component";
import { PaginationComponent } from "@shared/design-system/pagination/infrastructure/components/pagination.component";
import { ListTableComponent } from "@shared/design-system/list-table/infrastructure/components/list-table.component";
import {
  ListAction,
  ListActionEvent,
  ListColumn,
} from "@shared/design-system/list-table/domain/models/list-table.model";
import { ListFiltersComponent } from "@shared/design-system/list-filters/infrastructure/components/list-filters.component";
import { FilterField } from "@shared/design-system/list-filters/domain/models/list-filters.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { PageHeaderComponent } from "@shared/design-system/page-header/infrastructure/components/page-header.component";
import {
  AbstractListPageComponent,
  PagedResult,
} from "@shared/design-system/list-page/abstract-list-page.component";
import { GetInventoriesService } from "@nutrition/pantry/inventory/application/services/get-inventories.service";
import { InventoryViewService } from "@nutrition/pantry/inventory/application/services/inventory-view.service";
import { Inventory } from "../../domain/models/inventory.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";
import { InventoryStatus } from "../../domain/models/inventory-status.model";

@Component({
  selector: "app-get-inventories",
  templateUrl: "./get-inventories.component.html",
  imports: [
    PaginationComponent,
    ListTableComponent,
    ListFiltersComponent,
    ContextualTranslatePipe,
    ButtonComponent,
    SkeletonPageHeaderComponent,
    PageWrapperComponent,
    PageHeaderComponent,
  ],
})
export class GetInventoriesComponent extends AbstractListPageComponent<Inventory> {
  private getInventoriesService = inject(GetInventoriesService);
  private inventoryView = inject(InventoryViewService);

  protected readonly modulePath = "nutrition/pantry/inventory";
  protected readonly storageKey = "pageSize_inventories";

  filterShift = "";
  filterStatus = "";

  filterFields = computed<FilterField[]>(() => [
    {
      key: "shift",
      label: this.t("getInventories.filter.shift"),
      type: "select",
      placeholder: this.t("getInventories.filter.allShifts"),
      options: [
        {
          value: InventoryShift.MORNING,
          label: this.t("inventoryShift.morning"),
        },
        {
          value: InventoryShift.AFTERNOON,
          label: this.t("inventoryShift.afternoon"),
        },
        { value: InventoryShift.NIGHT, label: this.t("inventoryShift.night") },
      ],
    },
    {
      key: "status",
      label: this.t("getInventories.filter.status"),
      type: "select",
      placeholder: this.t("getInventories.filter.allStatuses"),
      options: [
        {
          value: InventoryStatus.DRAFT,
          label: this.t("inventoryStatus.draft"),
        },
        {
          value: InventoryStatus.VALIDATED,
          label: this.t("inventoryStatus.validated"),
        },
      ],
    },
  ]);

  columns = computed<ListColumn<Inventory>[]>(() => [
    {
      key: "countedOn",
      label: this.t("getInventories.table.countedOn"),
      value: (item) => item.attributes.countedOn,
      format: "date",
      width: "0.9fr",
      minWidth: "130px",
      cardPrimary: true,
    },
    {
      key: "shift",
      label: this.t("getInventories.table.shift"),
      value: (item) =>
        this.t(this.inventoryView.shiftKey(item.attributes.shift)),
      width: "0.7fr",
      minWidth: "110px",
    },
    {
      key: "location",
      label: this.t("getInventories.table.location"),
      value: (item) =>
        item.attributes.locationName ??
        this.t("getInventories.table.wholePantry"),
      width: "1fr",
      minWidth: "150px",
    },
    {
      key: "counted",
      label: this.t("getInventories.table.counted"),
      value: (item) =>
        `${item.attributes.countedLines}/${item.attributes.totalLines}`,
      width: "0.6fr",
      minWidth: "100px",
    },
    {
      key: "adjusted",
      label: this.t("getInventories.table.adjusted"),
      value: (item) => item.attributes.adjustedLines.toString(),
      width: "0.6fr",
      minWidth: "100px",
    },
    {
      key: "status",
      label: this.t("getInventories.table.status"),
      value: (item) =>
        this.t(this.inventoryView.statusKey(item.attributes.status)),
      badge: (item) =>
        InventoryStatus.VALIDATED === item.attributes.status
          ? "status-completed"
          : "status-pending",
      width: "0.7fr",
      minWidth: "120px",
    },
  ]);

  actions = computed<ListAction<Inventory>[]>(() => [
    {
      key: "view",
      label: this.t("getInventories.actions.view"),
      icon: "view",
    },
  ]);

  protected configureList(): void {}

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Inventory>> {
    return this.getInventoriesService.getInventories(
      page,
      pageSize,
      this.filterShift || undefined,
      this.filterStatus || undefined,
    );
  }

  protected override applyFilters(
    values: Record<string, string | boolean>,
  ): void {
    this.filterShift = (values["shift"] as string) || "";
    this.filterStatus = (values["status"] as string) || "";
  }

  protected override clearFilters(): void {
    this.filterShift = "";
    this.filterStatus = "";
  }

  protected override captureFilters(): Record<string, string> {
    return { shift: this.filterShift, status: this.filterStatus };
  }

  protected override restoreFilters(filters: Record<string, string>): void {
    this.filterShift = filters["shift"] ?? "";
    this.filterStatus = filters["status"] ?? "";
  }

  onStart(): void {
    this.router.navigate(["/inventory", "start"]);
  }

  onAction({ key, row }: ListActionEvent<Inventory>): void {
    if (key === "view") this.router.navigate(["/inventory", row.id]);
  }
}
