import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";
import {
  CalendarCell,
  CalendarDayMark,
} from "@shared/design-system/calendar/infrastructure/components/calendar.component";
import { AgendaCalendarDay } from "../../domain/models/agenda-calendar.model";

@Injectable()
export class AgendaCalendarViewService {
  private translationService = inject(TranslationService);

  private readonly weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

  monthOf(iso: string): string {
    return iso.slice(0, 7);
  }

  shiftMonth(month: string, offset: number): string {
    const [year, monthNumber] = this.split(month);

    return this.toMonth(new Date(year, monthNumber - 1 + offset, 1));
  }

  monthLabel(month: string): string {
    const [year, monthNumber] = this.split(month);
    const label = new Intl.DateTimeFormat(this.locale(), {
      month: "long",
      year: "numeric",
    }).format(new Date(year, monthNumber - 1, 1));

    return this.capitalize(label);
  }

  weekdays(): string[] {
    if (
      SupportedLanguages.EN === this.translationService.getCurrentLanguage()
    ) {
      return ["M", "T", "W", "T", "F", "S", "S"];
    }

    return this.weekdayLabels;
  }

  buildCells(
    month: string,
    days: AgendaCalendarDay[],
    selectedDate: string,
    todayIso: string,
  ): CalendarCell[] {
    const [year, monthNumber] = this.split(month);
    const monthIndex = monthNumber - 1;
    const startPad = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const dayByDate = this.indexByDate(days);

    const cells: CalendarCell[] = [];

    for (let pad = 0; pad < startPad; pad++) {
      cells.push(this.blankCell(pad));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = this.toIso(year, monthNumber, day);

      cells.push({
        key: `d${date}`,
        day,
        date,
        status: "plain",
        isToday: date === todayIso,
        isSelected: date === selectedDate,
        planned: false,
        disabled: false,
        mark: this.markFor(dayByDate[date]),
      });
    }

    return cells;
  }

  withToggledEntry(
    days: AgendaCalendarDay[],
    date: string,
    done: boolean,
  ): AgendaCalendarDay[] {
    return days.map((day) => {
      if (day.date !== date) return day;

      const pendingCount = done ? day.pendingCount - 1 : day.pendingCount + 1;

      return {
        ...day,
        pendingCount: Math.min(day.entryCount, Math.max(0, pendingCount)),
      };
    });
  }

  private markFor(day: AgendaCalendarDay | undefined): CalendarDayMark {
    if (!day || day.entryCount === 0) return "none";

    return day.pendingCount > 0 ? "pending" : "done";
  }

  private indexByDate(
    days: AgendaCalendarDay[],
  ): Record<string, AgendaCalendarDay> {
    return days.reduce<Record<string, AgendaCalendarDay>>((map, day) => {
      map[day.date] = day;
      return map;
    }, {});
  }

  private blankCell(index: number): CalendarCell {
    return {
      key: `b${index}`,
      day: null,
      date: "",
      status: "plain",
      isToday: false,
      isSelected: false,
      planned: false,
      disabled: true,
      mark: "none",
    };
  }

  private locale(): string {
    return SupportedLanguages.EN ===
      this.translationService.getCurrentLanguage()
      ? "en-GB"
      : "es-ES";
  }

  private split(month: string): [number, number] {
    const [year, monthNumber] = month.split("-").map((value) => Number(value));

    return [year, monthNumber];
  }

  private toMonth(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");

    return `${year}-${month}`;
  }

  private toIso(year: number, monthNumber: number, day: number): string {
    const month = `${monthNumber}`.padStart(2, "0");
    const paddedDay = `${day}`.padStart(2, "0");

    return `${year}-${month}-${paddedDay}`;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
