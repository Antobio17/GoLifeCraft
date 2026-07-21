import { Injectable } from "@angular/core";
import {
  CalendarCell,
  CalendarDayStatus,
  CalendarLegendItem,
} from "@shared/design-system/calendar/infrastructure/components/calendar.component";
import {
  DiaryCalendarDay,
  DiaryCalendarStatus,
} from "../../domain/models/diary-calendar.model";

@Injectable()
export class DiaryCalendarViewService {
  private readonly weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

  monthOf(iso: string): string {
    return iso.slice(0, 7);
  }

  shiftMonth(month: string, offset: number): string {
    const [year, monthNumber] = this.split(month);
    const date = new Date(year, monthNumber - 1 + offset, 1);

    return this.toMonth(date);
  }

  monthLabel(month: string): string {
    const [year, monthNumber] = this.split(month);
    const label = new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, monthNumber - 1, 1));

    return this.capitalize(label);
  }

  weekdays(): string[] {
    return this.weekdayLabels;
  }

  dayStatus(
    consumed: number,
    goal: number,
    entryCount: number,
  ): DiaryCalendarStatus {
    if (entryCount <= 0) return "rest";

    const ratio = goal > 0 ? consumed / goal : 0;

    if (ratio >= 0.9 && ratio <= 1.1) return "green";
    if (ratio >= 0.75 && ratio <= 1.25) return "orange";

    return "red";
  }

  legend(labels: Record<DiaryCalendarStatus, string>): CalendarLegendItem[] {
    return [
      { status: "green", label: labels.green },
      { status: "orange", label: labels.orange },
      { status: "red", label: labels.red },
      { status: "rest", label: labels.rest },
    ];
  }

  buildCells(
    month: string,
    days: DiaryCalendarDay[],
    selectedDate: string,
    todayIso: string,
  ): CalendarCell[] {
    const [year, monthNumber] = this.split(month);
    const monthIndex = monthNumber - 1;
    const first = new Date(year, monthIndex, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const statusByDate = this.indexByDate(days);

    const cells: CalendarCell[] = [];

    for (let pad = 0; pad < startPad; pad++) {
      cells.push(this.blankCell(pad));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = this.toIso(year, monthNumber, day);
      const isFuture = date > todayIso;
      const status = this.resolveStatus(statusByDate[date], isFuture);

      cells.push({
        key: `d${date}`,
        day,
        date,
        status,
        isToday: date === todayIso,
        isSelected: date === selectedDate,
        disabled: isFuture,
      });
    }

    return cells;
  }

  private resolveStatus(
    status: DiaryCalendarStatus | undefined,
    isFuture: boolean,
  ): CalendarDayStatus {
    if (isFuture) return "future";

    return status ?? "rest";
  }

  private indexByDate(
    days: DiaryCalendarDay[],
  ): Record<string, DiaryCalendarStatus> {
    return days.reduce<Record<string, DiaryCalendarStatus>>((map, day) => {
      map[day.date] = day.status;
      return map;
    }, {});
  }

  private blankCell(index: number): CalendarCell {
    return {
      key: `b${index}`,
      day: null,
      date: "",
      status: "rest",
      isToday: false,
      isSelected: false,
      disabled: true,
    };
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
