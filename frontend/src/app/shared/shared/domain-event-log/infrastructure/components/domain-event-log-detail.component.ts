import { Component, OnInit, OnDestroy, inject, signal } from "@angular/core";
import { NgClass } from "@angular/common";
import { Location } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { GetDomainEventLogService } from "../../application/services/get-domain-event-log.service";
import { DomainEventLogUtilsService } from "../../application/services/domain-event-log-utils.service";
import { DomainEventLog } from "../../domain/models/domain-event-log.model";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TranslationService } from "@shared/shared/i18n/application/services/translation.service";
import { PageWrapperComponent } from "@shared/shared/page-wrapper/infrastructure/components/page-wrapper.component";
import { PageHeaderComponent } from "@shared/shared/page-header/infrastructure/components/page-header.component";
import { ButtonComponent } from "@shared/shared/button/infrastructure/components/button.component";
import { SkeletonPageHeaderComponent } from "@shared/shared/skeleton/infrastructure/components/skeleton-page-header.component";
import { SkeletonFormSectionComponent } from "@shared/shared/skeleton/infrastructure/components/skeleton-form-section.component";
import { FormSectionComponent } from "@shared/shared/form-section/infrastructure/components/form-section.component";
import { ToggleComponent } from "@shared/shared/toggle/infrastructure/components/toggle.component";
import { FORM_SECTION_ICONS } from "@shared/shared/form-section/constants/form-section-icons.constants";
import { BreadcrumbService } from "@shared/shared/breadcrumbs/application/services/breadcrumb.service";

@Component({
  selector: "app-domain-event-log-detail",
  templateUrl: "./domain-event-log-detail.component.html",
  styleUrls: ["./domain-event-log-detail.component.css"],
  imports: [
    NgClass,
    FormsModule,
    RouterLink,
    ContextualTranslatePipe,
    PageWrapperComponent,
    PageHeaderComponent,
    ButtonComponent,
    SkeletonPageHeaderComponent,
    SkeletonFormSectionComponent,
    FormSectionComponent,
    ToggleComponent,
  ],
})
export class DomainEventLogDetailComponent implements OnInit, OnDestroy {
  private getDomainEventLogService = inject(GetDomainEventLogService);
  private eventUtils = inject(DomainEventLogUtilsService);
  private translationService = inject(TranslationService);
  private breadcrumbService = inject(BreadcrumbService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly MODULE_PATH = "shared/shared/domain-event-log";

  readonly ICONS = FORM_SECTION_ICONS;

  log = signal<DomainEventLog | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) {
      this.router.navigate(["/reports/logs"]);
      return;
    }

    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.loadLog(id);
      });
  }

  private loadLog(id: string): void {
    this.getDomainEventLogService.getDomainEventLog(id).subscribe({
      next: (response) => {
        this.log.set(response.data);
        this.loading.set(false);
        this.breadcrumbService.setDynamicLastLabel(
          this.eventUtils.translateEventName(response.data.eventName),
        );
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(["/reports/logs"]);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearDynamicLastLabel();
  }

  getEventBadgeClass(eventName: string): string {
    return this.eventUtils.getEventBadgeClass(eventName);
  }

  translateEventName(eventName: string): string {
    return this.eventUtils.translateEventName(eventName);
  }

  getPayloadEntries(
    payload: Record<string, unknown>,
  ): Array<{ key: string; value: unknown }> {
    const excludedKeys = new Set([
      "aggregateId",
      "id",
      "occurredOn",
      "createdByUserId",
      "createdAt",
      "updatedByUserId",
      "updatedAt",
      "deletedByUserId",
      "deletedAt",
    ]);

    return Object.entries(payload)
      .filter(([key]) => !excludedKeys.has(key))
      .map(([key, value]) => ({ key, value }));
  }

  isIsoDate(value: unknown): boolean {
    if (typeof value !== "string") return false;
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
  }

  isUuid(value: unknown): boolean {
    if (typeof value !== "string") return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  formatPayloadValue(value: unknown): string {
    if (typeof value === "string" && this.isIsoDate(value)) {
      return this.formatDateTime(value);
    }
    if (typeof value === "boolean") return value ? "Sí" : "No";
    if (value === null || value === undefined) return "—";
    return String(value);
  }

  getPayloadValueType(
    value: unknown,
  ): "date" | "boolean" | "uuid" | "array" | "text" {
    if (Array.isArray(value)) return "array";
    if (typeof value === "string" && this.isIsoDate(value)) return "date";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "string" && this.isUuid(value)) return "uuid";
    return "text";
  }

  asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  isObject(value: unknown): boolean {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  getObjectEntries(obj: unknown): Array<{ key: string; value: unknown }> {
    if (!this.isObject(obj)) return [];
    return Object.entries(obj as Record<string, unknown>).map(
      ([key, value]) => ({ key, value }),
    );
  }

  getPayloadKeyTranslation(key: string): string {
    return `payloadProperties.${key}`;
  }

  translatePayloadValue(key: string, value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "string" && this.isIsoDate(value)) {
      return this.formatDateTime(value);
    }
    if (typeof value === "string" && this.isUuid(value)) {
      return value;
    }
    if (typeof value === "string") {
      const translationKey = `payloadValues.${key}.${value}`;
      const translated = this.translationService.translate(
        translationKey,
        this.MODULE_PATH,
      );
      return translated !== translationKey ? translated : value;
    }
    return String(value);
  }

  private readonly ENTITY_ROUTES: Record<string, (id: string) => string> = {
    userId: (id) => `/users/${id}/edit`,
  };

  private readonly AGGREGATE_ROUTES: Record<string, (id: string) => string> = {
    user: (id) => `/users/${id}/edit`,
  };

  getEntityRoute(key: string, value: unknown): string | null {
    if (typeof value !== "string" || !this.isUuid(value)) return null;
    const builder = this.ENTITY_ROUTES[key];
    return builder ? builder(value) : null;
  }

  getAggregateRoute(eventName: string, aggregateId: string): string | null {
    const parts = eventName.split(".");
    const entitySegment = parts[4];
    if (!entitySegment) return null;

    const builder = this.AGGREGATE_ROUTES[entitySegment];
    return builder ? builder(aggregateId) : null;
  }
}
