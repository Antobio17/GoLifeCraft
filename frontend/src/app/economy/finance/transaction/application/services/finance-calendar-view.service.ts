import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";
import {
  CalendarCell,
  CalendarDayMark,
} from "@shared/design-system/calendar/infrastructure/components/calendar.component";
import { FinanceCalendarDay } from "../../domain/models/finance-calendar-day.model";

@Injectable()
export class FinanceCalendarViewService {
  private translationService = inject(TranslationService);

  private readonly weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

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
    days: FinanceCalendarDay[],
    selectedDate: string | null,
    todayIso: string,
  ): CalendarCell[] {
    const [year, monthNumber] = this.splitMonth(month);
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
        disabled: date > todayIso,
        mark: this.markFor(dayByDate[date]),
      });
    }

    return cells;
  }

  private markFor(day: FinanceCalendarDay | undefined): CalendarDayMark {
    if (!day || day.expense <= 0) return "none";

    return "pending";
  }

  private indexByDate(
    days: FinanceCalendarDay[],
  ): Record<string, FinanceCalendarDay> {
    return days.reduce<Record<string, FinanceCalendarDay>>((map, day) => {
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

  private splitMonth(month: string): [number, number] {
    const [year, monthNumber] = month.split("-").map((value) => Number(value));

    return [year, monthNumber];
  }

  private toIso(year: number, monthNumber: number, day: number): string {
    const month = `${monthNumber}`.padStart(2, "0");
    const paddedDay = `${day}`.padStart(2, "0");

    return `${year}-${month}-${paddedDay}`;
  }
}
