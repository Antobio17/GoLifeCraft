import {
  Directive,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, NavigationStart, Router } from "@angular/router";
import { Observable, filter } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ListPageStateService } from "./application/services/list-page-state.service";
import { ListPageSnapshot } from "./domain/models/list-page-snapshot.model";
import { ScrollRestoreService } from "@shared/design-system/scroll-restore/application/services/scroll-restore.service";

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
  private readonly listPageState = inject(ListPageStateService);
  private readonly scrollRestore = inject(ScrollRestoreService);

  private readonly listUrl = this.pathOf(
    this.router.getCurrentNavigation()?.finalUrl?.toString() ?? this.router.url,
  );
  private readonly previousUrl = this.resolvePreviousUrl();
  private scrollTop = 0;

  protected abstract readonly modulePath: string;
  protected abstract readonly storageKey: string;
  protected readonly appendsPages: boolean = false;

  protected abstract fetch(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<T>>;

  protected abstract configureList(): void;

  protected applyFilters(values: Record<string, string | boolean>): void {
    void values;
  }

  protected clearFilters(): void {}

  protected captureFilters(): Record<string, string> {
    return {};
  }

  protected restoreFilters(filters: Record<string, string>): void {
    void filters;
  }

  items = signal<T[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = signal(DEFAULT_PAGE_SIZE);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.scrollTop = this.scrollRestore.currentTop();
      });

    this.destroyRef.onDestroy(() => this.saveSnapshot());
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const savedPageSize =
      localStorage.getItem(this.storageKey) ?? String(DEFAULT_PAGE_SIZE);

    this.currentPage.set(parseInt(params.get("page") || "1", 10));
    this.pageSize.set(parseInt(params.get("pageSize") || savedPageSize, 10));

    const snapshot = this.pendingSnapshot();

    this.translationService.loadModuleTranslations(this.modulePath).then(() => {
      this.configureList();

      if (null === snapshot) {
        this.load();

        return;
      }

      this.restore(snapshot);
    });
  }

  protected t(key: string): string {
    return this.translationService.translate(key, this.modulePath);
  }

  private pathOf(url: string): string {
    return url.split("?")[0];
  }

  private resolvePreviousUrl(): string {
    const previous = this.router.getCurrentNavigation()?.previousNavigation;

    if (undefined === previous || null === previous) return "";

    return (previous.finalUrl ?? previous.extractedUrl).toString();
  }

  private pendingSnapshot(): ListPageSnapshot<T> | null {
    const snapshot = this.listPageState.take<T>(this.listUrl);

    if (null === snapshot) return null;
    if (!this.previousUrl.startsWith(`${this.listUrl}/`)) return null;

    return snapshot;
  }

  private restore(snapshot: ListPageSnapshot<T>): void {
    this.restoreFilters(snapshot.filters);
    this.items.set(snapshot.items);
    this.totalItems.set(snapshot.totalItems);
    this.currentPage.set(snapshot.currentPage);
    this.pageSize.set(snapshot.pageSize);
    this.loading.set(false);

    this.scrollRestore.restore(snapshot.scrollTop);
    this.refreshRestoredItems();
  }

  private refreshRestoredItems(): void {
    const page = this.appendsPages ? 1 : this.currentPage();
    const pageSize = this.appendsPages
      ? this.currentPage() * this.pageSize()
      : this.pageSize();

    this.fetch(page, pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.totalItems.set(response.meta.total);
        },
      });
  }

  private saveSnapshot(): void {
    if (0 === this.items().length) return;

    this.listPageState.save<T>(this.listUrl, {
      items: this.items(),
      totalItems: this.totalItems(),
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      scrollTop: this.scrollTop,
      filters: this.captureFilters(),
    });
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
