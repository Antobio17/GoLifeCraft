import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";
import {
  AgendaDayAttributes,
  AgendaEntryView,
} from "../../domain/models/agenda.model";

export type AgendaDayRelation = "today" | "yesterday" | "tomorrow" | "other";

@Injectable()
export class AgendaViewService {
  private translationService = inject(TranslationService);

  todayIso(): string {
    return this.toIso(new Date());
  }

  withToggledEntry(
    day: AgendaDayAttributes,
    entryId: string,
    done: boolean,
  ): AgendaDayAttributes {
    const entries = this.sortEntries(
      day.entries.map((entry) =>
        entry.id === entryId ? { ...entry, done } : entry,
      ),
    );
    const pendingCount = entries.filter((entry) => !entry.done).length;

    return {
      ...day,
      entries,
      pendingCount,
      doneCount: entries.length - pendingCount,
    };
  }

  whenLabel(
    entry: AgendaEntryView,
    todayLabel: string,
    tomorrowLabel: string,
  ): string {
    const day = this.relativeDayLabel(
      entry.entryDate,
      todayLabel,
      tomorrowLabel,
    );

    if (!entry.time) return day;

    return `${day} · ${entry.time}`;
  }

  private relativeDayLabel(
    iso: string,
    todayLabel: string,
    tomorrowLabel: string,
  ): string {
    const relation = this.relation(iso);

    if (relation === "today") return todayLabel;
    if (relation === "tomorrow") return tomorrowLabel;

    return this.dayShort(iso);
  }

  private sortEntries(entries: AgendaEntryView[]): AgendaEntryView[] {
    return [...entries].sort((left, right) => {
      if (left.done !== right.done) return left.done ? 1 : -1;

      return (left.time ?? "99:99").localeCompare(right.time ?? "99:99");
    });
  }

  addDays(iso: string, days: number): string {
    const date = this.parse(iso);
    date.setDate(date.getDate() + days);

    return this.toIso(date);
  }

  isToday(iso: string): boolean {
    return iso === this.todayIso();
  }

  relation(iso: string): AgendaDayRelation {
    const today = this.todayIso();

    if (iso === today) return "today";
    if (iso === this.addDays(today, -1)) return "yesterday";
    if (iso === this.addDays(today, 1)) return "tomorrow";

    return "other";
  }

  dayShort(iso: string): string {
    const date = this.parse(iso);
    const month = new Intl.DateTimeFormat(this.locale(), { month: "short" })
      .format(date)
      .replace(".", "");

    return `${date.getDate()} ${month}`;
  }

  dateRangeLabel(fromIso: string, toIso: string): string {
    if (fromIso === toIso) return this.dayShort(fromIso);

    return `${this.dayShort(fromIso)} - ${this.dayShort(toIso)}`;
  }

  dayLong(iso: string): string {
    const date = this.parse(iso);
    const weekday = new Intl.DateTimeFormat(this.locale(), {
      weekday: "long",
    }).format(date);

    return `${this.capitalize(weekday)}, ${this.dayShort(iso)}`;
  }

  private locale(): string {
    return SupportedLanguages.EN ===
      this.translationService.getCurrentLanguage()
      ? "en-GB"
      : "es-ES";
  }

  private parse(iso: string): Date {
    return new Date(`${iso}T00:00:00`);
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
