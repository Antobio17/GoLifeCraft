import { Injectable, inject } from "@angular/core";
import { KitchenFormatService } from "./kitchen-format.service";

@Injectable()
export class ProductionRangeService {
  private format = inject(KitchenFormatService);

  todayIso(): string {
    return this.toIso(new Date());
  }

  addDays(iso: string, days: number): string {
    const date = this.parse(iso);
    date.setDate(date.getDate() + days);

    return this.toIso(date);
  }

  /**
   * A range shown the way you would say it out loud: one day is just the day, a range inside the
   * same month drops the repeated month, and only a range across months spells both out.
   */
  rangeLabel(fromDate: string, toDate: string): string {
    const from = this.parse(fromDate);
    const to = this.parse(toDate);

    if (fromDate === toDate) {
      return this.capitalize(this.dayMonth(from));
    }

    if (
      from.getMonth() === to.getMonth() &&
      from.getFullYear() === to.getFullYear()
    ) {
      return `${from.getDate()}–${this.dayMonth(to)}`;
    }

    return `${this.dayMonth(from)} – ${this.dayMonth(to)}`;
  }

  dayCount(fromDate: string, toDate: string): number {
    const from = this.parse(fromDate).getTime();
    const to = this.parse(toDate).getTime();

    return Math.floor((to - from) / 86400000) + 1;
  }

  isBefore(fromDate: string, toDate: string): boolean {
    return toDate < fromDate;
  }

  servings(value: number): string {
    return this.format.decimal(value);
  }

  private dayMonth(date: Date): string {
    return new Intl.DateTimeFormat(this.format.locale(), {
      day: "numeric",
      month: "short",
    })
      .format(date)
      .replace(".", "");
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
