import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/shared/i18n/application/services/translation.service";

@Injectable({ providedIn: "root" })
export class DomainEventLogUtilsService {
  private translationService = inject(TranslationService);

  private readonly MODULE_PATH = "shared/shared/domain-event-log";

  getEventShortName(eventName: string): string {
    const parts = eventName.split(".");
    if (parts.length < 2) return eventName;
    return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  }

  getEventBadgeClass(eventName: string): string {
    if (!eventName) return "status-info";
    if (eventName.includes(".authorization.")) return "status-info";
    if (eventName.includes(".organization.")) return "status-success";
    if (eventName.includes(".cloud.")) return "status-accent";
    return "status-info";
  }

  translateEventName(eventName: string): string {
    const shortName = this.getEventShortName(eventName);
    return this.translationService.translate(
      `eventNames.${shortName}`,
      this.MODULE_PATH,
    );
  }
}
