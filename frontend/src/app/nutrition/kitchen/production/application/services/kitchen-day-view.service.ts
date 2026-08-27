import { Injectable, inject } from "@angular/core";
import { WeekDayTab } from "@shared/design-system/week-day-tabs/domain/models/week-day-tab.model";
import { KitchenDay } from "../../domain/models/kitchen-day.model";
import { KitchenWeekDay } from "../../domain/models/kitchen-week-day.model";
import { KitchenFormatService } from "./kitchen-format.service";

@Injectable()
export class KitchenDayViewService {
  private format = inject(KitchenFormatService);

  todayIso(): string {
    return this.toIso(new Date());
  }

  isToday(iso: string): boolean {
    return iso === this.todayIso();
  }

  addDays(iso: string, days: number): string {
    const date = this.parse(iso);
    date.setDate(date.getDate() + days);

    return this.toIso(date);
  }

  dateLine(iso: string): string {
    const date = this.parse(iso);
    const weekday = new Intl.DateTimeFormat(this.format.locale(), {
      weekday: "long",
    }).format(date);
    const day = new Intl.DateTimeFormat(this.format.locale(), {
      day: "numeric",
      month: "long",
    }).format(date);

    return `${this.capitalize(weekday)} ${day}`;
  }

  timeLabel(isoDateTime: string): string {
    const date = new Date(isoDateTime);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(this.format.locale(), {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  weekTabs(weekDays: KitchenWeekDay[], selectedIso: string): WeekDayTab[] {
    return weekDays.map((weekDay) => ({
      key: weekDay.date,
      label: this.weekDayLetter(weekDay.date),
      enabled: weekDay.hasItems,
      active: weekDay.date === selectedIso,
      hasItems: weekDay.hasItems,
    }));
  }

  pendingServings(day: KitchenDay): number {
    return day.toCook.reduce((total, item) => total + item.deficit, 0);
  }

  hasAnything(day: KitchenDay): boolean {
    return (
      day.toCook.length > 0 || day.expected.length > 0 || day.done.length > 0
    );
  }

  servings(value: number): string {
    return this.format.decimal(value);
  }

  private weekDayLetter(iso: string): string {
    const letter = new Intl.DateTimeFormat(this.format.locale(), {
      weekday: "narrow",
    }).format(this.parse(iso));

    return letter.toUpperCase();
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private parse(iso: string): Date {
    const [year, month, day] = iso.split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  private toIso(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
  }
}
