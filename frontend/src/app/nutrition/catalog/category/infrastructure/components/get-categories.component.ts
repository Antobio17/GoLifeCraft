import { Component, inject } from "@angular/core";
import { Observable } from "rxjs";
import { SkeletonPageHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-page-header.component";
import { GetCategoriesService } from "@nutrition/catalog/category/application/services/get-categories.service";
import { Category } from "../../domain/models/category.model";
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

@Component({
  selector: "app-get-categories",
  templateUrl: "./get-categories.component.html",
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
export class GetCategoriesComponent extends AbstractListPageComponent<Category> {
  private getCategoriesService = inject(GetCategoriesService);

  protected readonly modulePath = "nutrition/catalog/category";
  protected readonly storageKey = "pageSize_categories";

  filterName = "";
  filterFields: FilterField[] = [];
  columns: ListColumn<Category>[] = [];
  actions: ListAction<Category>[] = [];

  protected configureList(): void {
    this.filterFields = [
      {
        key: "name",
        label: this.t("getCategories.filter.name"),
        type: "text",
        placeholder: this.t("getCategories.filter.namePlaceholder"),
      },
    ];

    this.columns = [
      {
        key: "name",
        label: this.t("getCategories.table.name"),
        value: (item) => item.attributes.name,
        width: "1fr",
        minWidth: "200px",
        cardPrimary: true,
      },
    ];

    this.actions = [
      {
        key: "edit",
        label: this.t("getCategories.actions.edit"),
        icon: "edit",
      },
    ];
  }

  protected fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<Category>> {
    return this.getCategoriesService.getCategories(
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

  onCreate(): void {
    this.router.navigate(["/categories", "create"]);
  }

  onEdit(id: string): void {
    this.router.navigate(["/categories", id, "edit"]);
  }

  onAction({ key, row }: ListActionEvent<Category>): void {
    if (key === "edit") this.onEdit(row.id);
  }
}
