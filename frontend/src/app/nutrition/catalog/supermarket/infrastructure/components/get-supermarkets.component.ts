import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { SkeletonPageHeaderComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-page-header.component";
import { GetSupermarketsService } from "@nutrition/catalog/supermarket/application/services/get-supermarkets.service";
import { GetSupermarketsResponse } from "@nutrition/catalog/supermarket/domain/models/get-supermarkets-response.model";
import { Supermarket } from "../../domain/models/supermarket.model";
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
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { PageHeaderComponent } from "@shared/design-system/page-header/infrastructure/components/page-header.component";

@Component({
  selector: "app-get-supermarkets",
  templateUrl: "./get-supermarkets.component.html",
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
export class GetSupermarketsComponent implements OnInit {
  private getSupermarketsService = inject(GetSupermarketsService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "nutrition/catalog/supermarket";

  items = signal<Supermarket[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  filterName = "";
  filterFields: FilterField[] = [];
  columns: ListColumn<Supermarket>[] = [];
  actions: ListAction<Supermarket>[] = [];

  private readonly PAGE_SIZE_KEY = "pageSize_supermarkets";

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
            label: this.t("getSupermarkets.filter.name"),
            type: "text",
            placeholder: this.t("getSupermarkets.filter.namePlaceholder"),
          },
        ];

        this.columns = [
          {
            key: "name",
            label: this.t("getSupermarkets.table.name"),
            value: (item) => item.attributes.name,
            width: "1fr",
            minWidth: "200px",
            cardPrimary: true,
          },
        ];

        this.actions = [
          {
            key: "edit",
            label: this.t("getSupermarkets.actions.edit"),
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

    this.getSupermarketsService
      .getSupermarkets(
        this.currentPage(),
        this.pageSize(),
        this.filterName || undefined,
      )
      .subscribe({
        next: (response: GetSupermarketsResponse) => {
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
    this.router.navigate(["/supermarkets", "create"]);
  }

  onEdit(id: string): void {
    this.router.navigate(["/supermarkets", id, "edit"]);
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

  onAction({ key, row }: ListActionEvent<Supermarket>): void {
    if (key === "edit") this.onEdit(row.id);
  }
}
