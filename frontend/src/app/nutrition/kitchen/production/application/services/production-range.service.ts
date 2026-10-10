import { Injectable, inject } from "@angular/core";
import { WeekStripDay } from "@shared/design-system/week-strip/domain/models/week-strip-day.model";
import { WeekStripDayState } from "@shared/design-system/week-strip/domain/models/week-strip-day-state.enum";
import { KitchenFormatService } from "./kitchen-format.service";
import { ProductionDateRange } from "../../domain/models/production-date-range.model";
import { ProductionRangePreset } from "../../domain/models/production-range-preset.enum";

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

  dayLabel(iso: string): string {
    return this.capitalize(
      new Intl.DateTimeFormat(this.format.locale(), {
        weekday: "long",
        day: "numeric",
      }).format(this.parse(iso)),
    );
  }

  weekdayRange(fromDate: string, toDate: string): string {
    if (fromDate === toDate) {
      return this.weekday(fromDate, "long");
    }

    return `${this.weekday(fromDate, "short")}–${this.weekday(toDate, "short")}`;
  }

  weekday(iso: string, width: "long" | "short"): string {
    return new Intl.DateTimeFormat(this.format.locale(), { weekday: width })
      .format(this.parse(iso))
      .replace(".", "");
  }

  dayOfMonth(iso: string): string {
    return `${this.parse(iso).getDate()}`;
  }

  isIsoDate(value: string | undefined): value is string {
    return undefined !== value && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  dayCount(fromDate: string, toDate: string): number {
    const from = this.parse(fromDate).getTime();
    const to = this.parse(toDate).getTime();

    return Math.floor((to - from) / 86400000) + 1;
  }

  isInverted(fromDate: string, toDate: string): boolean {
    return toDate < fromDate;
  }

  presets(): ProductionRangePreset[] {
    return [
      ProductionRangePreset.ThreeDays,
      ProductionRangePreset.FiveDays,
      ProductionRangePreset.Week,
      ProductionRangePreset.Custom,
    ];
  }

  presetRange(preset: ProductionRangePreset): ProductionDateRange | null {
    if (ProductionRangePreset.Custom === preset) return null;

    const fromDate = this.todayIso();

    return { fromDate, toDate: this.addDays(fromDate, Number(preset) - 1) };
  }

  presetOf(fromDate: string, toDate: string): ProductionRangePreset {
    if (fromDate !== this.todayIso()) return ProductionRangePreset.Custom;

    const days = `${this.dayCount(fromDate, toDate)}`;

    return (
      this.presets().find((preset) => preset === days) ??
      ProductionRangePreset.Custom
    );
  }

  pickDay(range: ProductionDateRange, day: string): ProductionDateRange {
    if (this.isInverted(range.fromDate, day)) {
      return { fromDate: day, toDate: range.toDate };
    }

    return { fromDate: range.fromDate, toDate: day };
  }

  widen(range: ProductionDateRange, days: number): ProductionDateRange {
    return {
      fromDate: range.fromDate,
      toDate: this.addDays(range.toDate, days),
    };
  }

  stripDays(fromDate: string): WeekStripDay[] {
    const today = this.todayIso();

    return Array.from({ length: 7 }, (_, index) =>
      this.addDays(fromDate, index),
    ).map((date) => ({
      key: date,
      date,
      weekday: this.weekday(date, "short"),
      day: this.dayOfMonth(date),
      state: date === today ? WeekStripDayState.Today : WeekStripDayState.Rest,
      ariaLabel: this.dayLabel(date),
    }));
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
