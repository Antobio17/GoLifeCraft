import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { GetDomainEventLogsService } from "../../application/services/get-domain-event-logs.service";
import { DomainEventLogUtilsService } from "../../application/services/domain-event-log-utils.service";
import {
  DomainEventLog,
  KNOWN_EVENT_NAMES,
} from "../../domain/models/domain-event-log.model";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TranslationService } from "@shared/shared/i18n/application/services/translation.service";
import { FilterSelectOption } from "@shared/shared/list-filters/domain/models/list-filters.model";
import { PaginationComponent } from "@shared/shared/pagination/infrastructure/components/pagination.component";
import { PageWrapperComponent } from "@shared/shared/page-wrapper/infrastructure/components/page-wrapper.component";
import { PageHeaderComponent } from "@shared/shared/page-header/infrastructure/components/page-header.component";
import { SkeletonPageHeaderComponent } from "@shared/shared/skeleton/infrastructure/components/skeleton-page-header.component";
import { ListTableComponent } from "@shared/shared/list-table/infrastructure/components/list-table.component";
import { ListFiltersComponent } from "@shared/shared/list-filters/infrastructure/components/list-filters.component";
import {
  ListColumn,
  ListAction,
  ListActionEvent,
} from "@shared/shared/list-table/domain/models/list-table.model";
import { FilterField } from "@shared/shared/list-filters/domain/models/list-filters.model";

@Component({
  selector: "app-domain-event-log",
  templateUrl: "./domain-event-log.component.html",
  styleUrls: ["./domain-event-log.component.css"],
  imports: [
    ContextualTranslatePipe,
    PaginationComponent,
    PageWrapperComponent,
    PageHeaderComponent,
    SkeletonPageHeaderComponent,
    ListTableComponent,
    ListFiltersComponent,
  ],
})
export class DomainEventLogComponent implements OnInit {
  private getDomainEventLogsService = inject(GetDomainEventLogsService);
  private eventUtils = inject(DomainEventLogUtilsService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly MODULE_PATH = "shared/shared/domain-event-log";

  logs = signal<DomainEventLog[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = signal(10);
  totalLogs = signal(0);
  totalPages = computed(() => Math.ceil(this.totalLogs() / this.pageSize()));

  filterEventName = "";
  filterDateFrom = "";
  filterDateTo = "";

  filterFields: FilterField[] = [];
  columns: ListColumn<DomainEventLog>[] = [];
  actions: ListAction<DomainEventLog>[] = [];

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.currentPage.set(parseInt(params.get("page") || "1", 10));
    this.pageSize.set(parseInt(params.get("pageSize") || "10", 10));

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.filterFields = [
          {
            key: "eventName",
            label: this.t("domainEventLog.filter.eventName"),
            type: "select",
            placeholder: this.t("domainEventLog.filter.eventNamePlaceholder"),
            options: this.buildEventNameOptions(),
          },
          {
            key: "dateFrom",
            label: this.t("domainEventLog.filter.dateFrom"),
            type: "date",
          },
          {
            key: "dateTo",
            label: this.t("domainEventLog.filter.dateTo"),
            type: "date",
          },
        ];

        this.columns = [
          {
            key: "eventName",
            label: this.t("domainEventLog.table.event"),
            value: (log) => this.eventUtils.translateEventName(log.eventName),
            badge: (log) => this.eventUtils.getEventBadgeClass(log.eventName),
            width: "2fr",
            cardPrimary: true,
          },
          {
            key: "user",
            label: this.t("domainEventLog.table.user"),
            value: (log) => `${log.user.name} ${log.user.lastname}`,
          },
          {
            key: "occurredOn",
            label: this.t("domainEventLog.table.occurredOn"),
            value: (log) => log.occurredOn,
            format: "datetime",
          },
        ];

        this.actions = [
          {
            key: "view",
            label: this.t("domainEventLog.table.viewDetail"),
            icon: "view",
          },
        ];

        this.loadLogs();
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

  private buildEventNameOptions(): FilterSelectOption[] {
    return KNOWN_EVENT_NAMES.map((eventName) => ({
      value: eventName,
      label: this.t(`eventNames.${eventName}`),
    }));
  }

  loadLogs(): void {
    this.loading.set(true);

    this.getDomainEventLogsService
      .getDomainEventLogs(
        this.currentPage(),
        this.pageSize(),
        this.filterEventName || undefined,
        this.filterDateFrom || undefined,
        this.filterDateTo || undefined,
      )
      .subscribe({
        next: (response) => {
          this.logs.set(response.data);
          this.totalLogs.set(response.meta.total);
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
    this.loadLogs();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.updateQueryParams();
    this.loadLogs();
  }

  onFiltersApplied(values: Record<string, string | boolean>): void {
    this.filterEventName = (values["eventName"] as string) || "";
    this.filterDateFrom = (values["dateFrom"] as string) || "";
    this.filterDateTo = (values["dateTo"] as string) || "";
    this.currentPage.set(1);
    this.loadLogs();
  }

  onFiltersCleared(): void {
    this.filterEventName = "";
    this.filterDateFrom = "";
    this.filterDateTo = "";
    this.currentPage.set(1);
    this.loadLogs();
  }

  onAction({ key, row }: ListActionEvent<DomainEventLog>): void {
    if (key === "view") this.router.navigate(["/reports/logs", row.id]);
  }
}
