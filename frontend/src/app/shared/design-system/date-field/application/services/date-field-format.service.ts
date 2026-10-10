import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";

@Injectable()
export class DateFieldFormatService {
  private translationService = inject(TranslationService);

  shortLabel(iso: string, todayIso: string): string {
    const date = this.parse(iso);
    if (!date) {
      return "";
    }

    const sameYear = iso.slice(0, 4) === todayIso.slice(0, 4);

    return new Intl.DateTimeFormat(this.translationService.getLocale(), {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: sameYear ? undefined : "numeric",
    })
      .format(date)
      .replace(/\./g, "");
  }

  longLabel(iso: string): string {
    const date = this.parse(iso);
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat(this.translationService.getLocale(), {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  monthLabel(month: string): string {
    const date = this.parse(`${month}-01`);
    if (!date) {
      return "";
    }

    const label = new Intl.DateTimeFormat(this.translationService.getLocale(), {
      month: "long",
      year: "numeric",
    }).format(date);

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  weekdayInitial(iso: string): string {
    const date = this.parse(iso);
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat(this.translationService.getLocale(), {
      weekday: "narrow",
    })
      .format(date)
      .toUpperCase();
  }

  private parse(iso: string): Date | null {
    const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }
}
