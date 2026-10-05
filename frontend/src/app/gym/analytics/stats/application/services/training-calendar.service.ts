import { Injectable } from "@angular/core";
import { TrainingDay } from "../../domain/models/gym-stats.model";
import { CalendarDay } from "../../domain/models/calendar-day.model";
import { TrainingTotals } from "../../domain/models/training-totals.model";

const DAYS_PER_WEEK = 7;
const LEVEL_COUNT = 3;

@Injectable({ providedIn: "root" })
export class TrainingCalendarService {
  lastDays(
    days: TrainingDay[],
    count: number,
    today: Date = new Date(),
  ): CalendarDay[] {
    const end = this.startOfDay(today);
    const index = this.indexByDate(days);
    const maxVolume = this.maxVolume(days);

    return Array.from({ length: count }, (_, offset) =>
      this.calendarDay(
        this.shift(end, offset - count + 1),
        index,
        maxVolume,
        end,
      ),
    );
  }

  monthGrid(
    days: TrainingDay[],
    year: number,
    month: number,
    today: Date = new Date(),
  ): (CalendarDay | null)[] {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leading = this.weekdayIndex(first);
    const index = this.indexByDate(days);
    const maxVolume = this.maxVolume(days);
    const end = this.startOfDay(today);

    const cells: (CalendarDay | null)[] = Array.from(
      { length: leading },
      () => null,
    );

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(
        this.calendarDay(new Date(year, month, day), index, maxVolume, end),
      );
    }

    while (cells.length % DAYS_PER_WEEK !== 0) {
      cells.push(null);
    }

    return cells;
  }

  streakWeeks(days: TrainingDay[], today: Date = new Date()): number {
    const trainedWeeks = new Set(
      days
        .filter((day) => day.workouts > 0)
        .map((day) => this.toIso(this.weekStart(this.fromIso(day.date)))),
    );

    let cursor = this.weekStart(this.startOfDay(today));

    if (!trainedWeeks.has(this.toIso(cursor))) {
      cursor = this.shift(cursor, -DAYS_PER_WEEK);
    }

    let streak = 0;

    while (trainedWeeks.has(this.toIso(cursor))) {
      streak++;
      cursor = this.shift(cursor, -DAYS_PER_WEEK);
    }

    return streak;
  }

  totals(days: TrainingDay[], from: Date, to: Date): TrainingTotals {
    const start = this.startOfDay(from);
    const end = this.startOfDay(to);

    return days
      .filter((day) => {
        const date = this.fromIso(day.date);

        return date >= start && date <= end;
      })
      .reduce<TrainingTotals>(
        (totals, day) => ({
          workouts: totals.workouts + day.workouts,
          volumeKg: totals.volumeKg + day.volumeKg,
          minutes: totals.minutes + day.minutes,
        }),
        { workouts: 0, volumeKg: 0, minutes: 0 },
      );
  }

  firstMonth(days: TrainingDay[]): Date | null {
    if (days.length === 0) {
      return null;
    }

    const earliest = days
      .map((day) => this.fromIso(day.date))
      .reduce((min, date) => (date < min ? date : min));

    return new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  }

  weekStart(date: Date): Date {
    return this.shift(this.startOfDay(date), -this.weekdayIndex(date));
  }

  shift(date: Date, days: number): Date {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() + days);

    return shifted;
  }

  startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  daysBetween(from: Date, to: Date): number {
    const start = this.startOfDay(from);
    const end = this.startOfDay(to);

    return Math.round((end.getTime() - start.getTime()) / 86_400_000);
  }

  private calendarDay(
    date: Date,
    index: Map<string, TrainingDay>,
    maxVolume: number,
    today: Date,
  ): CalendarDay {
    const iso = this.toIso(date);
    const day = index.get(iso);

    return {
      iso,
      date,
      workouts: day?.workouts ?? 0,
      volumeKg: day?.volumeKg ?? 0,
      minutes: day?.minutes ?? 0,
      level: this.levelOf(day, maxVolume),
      isToday: iso === this.toIso(today),
    };
  }

  private levelOf(day: TrainingDay | undefined, maxVolume: number): number {
    if (!day || day.workouts === 0) {
      return 0;
    }

    if (maxVolume <= 0) {
      return 2;
    }

    return Math.max(1, Math.ceil((day.volumeKg / maxVolume) * LEVEL_COUNT));
  }

  private maxVolume(days: TrainingDay[]): number {
    return Math.max(0, ...days.map((day) => day.volumeKg));
  }

  private weekdayIndex(date: Date): number {
    return (date.getDay() + 6) % DAYS_PER_WEEK;
  }

  private indexByDate(days: TrainingDay[]): Map<string, TrainingDay> {
    return new Map(days.map((day) => [day.date, day]));
  }

  private toIso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
  }

  private fromIso(iso: string): Date {
    const [year, month, day] = iso.split("-").map(Number);

    return new Date(year, month - 1, day);
  }
}
