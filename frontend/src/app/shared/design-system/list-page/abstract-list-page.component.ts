import {
  Directive,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";

export interface PagedResult<T> {
  data: T[];
  meta: { total: number };
}

const DEFAULT_PAGE_SIZE = 20;

@Directive()
export abstract class AbstractListPageComponent<T> implements OnInit {
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly translationService = inject(TranslationService);
  protected readonly destroyRef = inject(DestroyRef);

  protected abstract readonly modulePath: string;
  protected abstract readonly storageKey: string;

  protected abstract fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<T>>;

  protected abstract configureList(): void;

  protected applyFilters(values: Record<string, string | boolean>): void {
    void values;
  }

  protected clearFilters(): void {}

  items = signal<T[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = signal(DEFAULT_PAGE_SIZE);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const savedPageSize =
      localStorage.getItem(this.storageKey) ?? String(DEFAULT_PAGE_SIZE);

    this.currentPage.set(parseInt(params.get("page") || "1", 10));
    this.pageSize.set(parseInt(params.get("pageSize") || savedPageSize, 10));

    this.translationService.loadModuleTranslations(this.modulePath).then(() => {
      this.configureList();
      this.load();
    });
  }

  protected t(key: string): string {
    return this.translationService.translate(key, this.modulePath);
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

    this.fetch(this.currentPage(), this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.totalItems.set(response.meta.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;

    this.currentPage.set(page);
    this.updateQueryParams();
    this.load();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    localStorage.setItem(this.storageKey, String(newSize));
    this.updateQueryParams();
    this.load();
  }

  onFiltersApplied(values: Record<string, string | boolean>): void {
    this.applyFilters(values);
    this.currentPage.set(1);
    this.load();
  }

  onFiltersCleared(): void {
    this.clearFilters();
    this.currentPage.set(1);
    this.load();
  }
}
