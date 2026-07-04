import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { SkeletonPageHeaderComponent } from "@shared/shared/skeleton/infrastructure/components/skeleton-page-header.component";
import { GetCategoriesService } from "@nutrition/catalog/category/application/services/get-categories.service";
import { GetCategoriesResponse } from "@nutrition/catalog/category/domain/models/get-categories-response.model";
import { Category } from "../../domain/models/category.model";
import { PaginationComponent } from "@shared/shared/pagination/infrastructure/components/pagination.component";
import { ListTableComponent } from "@shared/shared/list-table/infrastructure/components/list-table.component";
import {
  ListAction,
  ListActionEvent,
  ListColumn,
} from "@shared/shared/list-table/domain/models/list-table.model";
import { ListFiltersComponent } from "@shared/shared/list-filters/infrastructure/components/list-filters.component";
import { FilterField } from "@shared/shared/list-filters/domain/models/list-filters.model";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TranslationService } from "@shared/shared/i18n/application/services/translation.service";
import { ButtonComponent } from "@shared/shared/button/infrastructure/components/button.component";
import { PageWrapperComponent } from "@shared/shared/page-wrapper/infrastructure/components/page-wrapper.component";
import { PageHeaderComponent } from "@shared/shared/page-header/infrastructure/components/page-header.component";

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
export class GetCategoriesComponent implements OnInit {
  private getCategoriesService = inject(GetCategoriesService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "nutrition/catalog/category";

  items = signal<Category[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  filterName = "";
  filterFields: FilterField[] = [];
  columns: ListColumn<Category>[] = [];
  actions: ListAction<Category>[] = [];

  private readonly PAGE_SIZE_KEY = "pageSize_categories";

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.currentPage.set(parseInt(params.get("page") || "1", 10));
    const savedPageSize = localStorage.getItem(this.PAGE_SIZE_KEY) ?? "20";
    this.pageSize.set(parseInt(params.get("pageSize") || savedPageSize, 10));

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
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

        this.load();
      });
  }

  private t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage(), pageSize: this.pageSize() },
      replaceUrl: true,
    });
  }

  load(): void {
    this.loading.set(true);

    this.getCategoriesService
      .getCategories(
        this.currentPage(),
        this.pageSize(),
        this.filterName || undefined,
      )
      .subscribe({
        next: (response: GetCategoriesResponse) => {
          this.items.set(response.data);
          this.totalItems.set(response.meta.total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.updateQueryParams();
    this.load();
  }

  onCreate(): void {
    this.router.navigate(["/categories", "create"]);
  }

  onEdit(id: string): void {
    this.router.navigate(["/categories", id, "edit"]);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    localStorage.setItem(this.PAGE_SIZE_KEY, String(newSize));
    this.updateQueryParams();
    this.load();
  }

  onFiltersApplied(values: Record<string, string | boolean>): void {
    this.filterName = (values["name"] as string) || "";
    this.currentPage.set(1);
    this.load();
  }

  onFiltersCleared(): void {
    this.filterName = "";
    this.currentPage.set(1);
    this.load();
  }

  onAction({ key, row }: ListActionEvent<Category>): void {
    if (key === "edit") this.onEdit(row.id);
  }
}
