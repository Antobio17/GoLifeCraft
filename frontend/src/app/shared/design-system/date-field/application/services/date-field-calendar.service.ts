import { Injectable, inject } from "@angular/core";
import { CalendarCell } from "@shared/design-system/calendar/infrastructure/components/calendar.component";
import { WeekStripDay } from "@shared/design-system/week-strip/domain/models/week-strip-day.model";
import { WeekStripDayState } from "@shared/design-system/week-strip/domain/models/week-strip-day-state.enum";
import { DateFieldFormatService } from "./date-field-format.service";

@Injectable()
export class DateFieldCalendarService {
  private format = inject(DateFieldFormatService);

  todayIso(): string {
    return this.toIso(new Date());
  }

  monthOf(iso: string): string {
    return iso.slice(0, 7);
  }

  shiftMonth(month: string, offset: number): string {
    const [year, monthNumber] = month.split("-").map(Number);

    return this.toIso(new Date(year, monthNumber - 1 + offset, 1)).slice(0, 7);
  }

  isAllowed(iso: string, min: string, max: string): boolean {
    if (min && iso < min) {
      return false;
    }

    return !max || iso <= max;
  }

  clamp(iso: string, min: string, max: string): string {
    if (min && iso < min) {
      return min;
    }

    if (max && iso > max) {
      return max;
    }

    return iso;
  }

  weekdays(): string[] {
    return this.weekOf("2024-01-01").map((iso) =>
      this.format.weekdayInitial(iso),
    );
  }

  cells(
    month: string,
    selected: string,
    todayIso: string,
    min: string,
    max: string,
  ): CalendarCell[] {
    const [year, monthNumber] = month.split("-").map(Number);
    const first = new Date(year, monthNumber - 1, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthNumber, 0).getDate();

    const blanks = Array.from({ length: startPad }, (_, index) =>
      this.blankCell(index),
    );
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const date = this.toIso(new Date(year, monthNumber - 1, index + 1));

      return {
        key: `d${date}`,
        day: index + 1,
        date,
        status: "plain" as const,
        isToday: date === todayIso,
        isSelected: date === selected,
        planned: false,
        disabled: !this.isAllowed(date, min, max),
      };
    });

    return [...blanks, ...days];
  }

  weekDays(anchor: string, todayIso: string): WeekStripDay[] {
    return this.weekOf(anchor).map((date) => ({
      key: date,
      date,
      weekday: this.format.weekdayInitial(date),
      day: String(Number(date.slice(8, 10))),
      state:
        date === todayIso ? WeekStripDayState.Today : WeekStripDayState.Rest,
      ariaLabel: this.format.longLabel(date),
    }));
  }

  private weekOf(anchor: string): string[] {
    const [year, month, day] = anchor.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const monday = day - ((date.getDay() + 6) % 7);

    return Array.from({ length: 7 }, (_, index) =>
      this.toIso(new Date(year, month - 1, monday + index)),
    );
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
    };
  }

  private toIso(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
  }
}
