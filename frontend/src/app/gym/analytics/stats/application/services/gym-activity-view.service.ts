import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { SupportedLanguages } from "@shared/i18n/domain/models/translation.model";
import {
  ActivityHeatmapMonth,
  ActivityHeatmapWeek,
} from "@shared/design-system/activity-heatmap/infrastructure/components/activity-heatmap.component";
import { TrainingDay } from "../../domain/models/gym-stats.model";

export interface GymActivityView {
  weeks: ActivityHeatmapWeek[];
  months: ActivityHeatmapMonth[];
  weekdays: string[];
  activeDays: number;
}

const DAYS_PER_WEEK = 7;
const WEEKDAY_LABEL_ROWS = [0, 2, 4];

@Injectable()
export class GymActivityViewService {
  private translationService = inject(TranslationService);

  private readonly modulePath = "dashboard/dashboard";

  build(days: TrainingDay[], weekCount: number): GymActivityView {
    const today = this.startOfDay(new Date());
    const start = this.gridStart(today, weekCount);
    const dayByDate = this.indexByDate(days);
    const maxVolume = Math.max(...days.map((day) => day.volumeKg), 0);

    const weeks: ActivityHeatmapWeek[] = [];

    for (let column = 0; column < weekCount; column++) {
      const cells = [];

      for (let row = 0; row < DAYS_PER_WEEK; row++) {
        const date = this.shift(start, column * DAYS_PER_WEEK + row);
        const iso = this.toIso(date);
        const day = dayByDate.get(iso);

        cells.push({
          date: iso,
          level: this.levelOf(day, maxVolume),
          label: this.labelOf(date, day),
          today: iso === this.toIso(today),
          placeholder: date > today,
        });
      }

      weeks.push({
        key: this.toIso(this.shift(start, column * DAYS_PER_WEEK)),
        cells,
      });
    }

    return {
      weeks,
      months: this.buildMonths(start, weekCount),
      weekdays: this.weekdays(),
      activeDays: this.countActiveDays(days, start, today),
    };
  }

  private buildMonths(start: Date, weekCount: number): ActivityHeatmapMonth[] {
    const months: ActivityHeatmapMonth[] = [];
    let lastMonth = -1;

    for (let column = 0; column < weekCount; column++) {
      const date = this.shift(start, column * DAYS_PER_WEEK + 6);
      const month = date.getMonth();

      if (month === lastMonth) {
        continue;
      }

      lastMonth = month;
      months.push({
        key: `${date.getFullYear()}-${month}`,
        label: this.monthLabel(date),
        column: column + 1,
      });
    }

    return months;
  }

  private weekdays(): string[] {
    const labels =
      SupportedLanguages.EN === this.translationService.getCurrentLanguage()
        ? ["M", "T", "W", "T", "F", "S", "S"]
        : ["L", "M", "X", "J", "V", "S", "D"];

    return labels.map((label, row) =>
      WEEKDAY_LABEL_ROWS.includes(row) ? label : "",
    );
  }

  private countActiveDays(
    days: TrainingDay[],
    start: Date,
    today: Date,
  ): number {
    return days.filter((day) => {
      const date = this.fromIso(day.date);

      return date >= start && date <= today && day.workouts > 0;
    }).length;
  }

  private levelOf(day: TrainingDay | undefined, maxVolume: number): number {
    if (!day || day.workouts === 0) {
      return 0;
    }

    if (maxVolume <= 0) {
      return 2;
    }

    const ratio = day.volumeKg / maxVolume;

    if (ratio < 0.25) {
      return 1;
    }

    if (ratio < 0.5) {
      return 2;
    }

    if (ratio < 0.75) {
      return 3;
    }

    return 4;
  }

  private labelOf(date: Date, day: TrainingDay | undefined): string {
    const dateLabel = this.dateLabel(date);

    if (!day || day.workouts === 0) {
      return this.translate("dashboard.gym.activity.tooltipEmpty", {
        date: dateLabel,
      });
    }

    const key =
      1 === day.workouts
        ? "dashboard.gym.activity.tooltipOne"
        : "dashboard.gym.activity.tooltip";

    return this.translate(key, {
      date: dateLabel,
      workouts: day.workouts,
      volume: this.volumeLabel(day.volumeKg),
    });
  }

  private dateLabel(date: Date): string {
    return new Intl.DateTimeFormat(this.locale(), {
      day: "numeric",
      month: "short",
    }).format(date);
  }

  private monthLabel(date: Date): string {
    const label = new Intl.DateTimeFormat(this.locale(), {
      month: "short",
    })
      .format(date)
      .replace(".", "");

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  private volumeLabel(volumeKg: number): string {
    return new Intl.NumberFormat(this.locale(), {
      maximumFractionDigits: 0,
    }).format(volumeKg);
  }

  private translate(key: string, params: Record<string, unknown>): string {
    return this.translationService.translate(key, this.modulePath, params);
  }

  private locale(): string {
    return SupportedLanguages.EN ===
      this.translationService.getCurrentLanguage()
      ? "en-US"
      : "es-ES";
  }

  private indexByDate(days: TrainingDay[]): Map<string, TrainingDay> {
    return new Map(days.map((day) => [day.date, day]));
  }

  private gridStart(today: Date, weekCount: number): Date {
    const weekday = (today.getDay() + 6) % 7;

    return this.shift(today, -weekday - (weekCount - 1) * DAYS_PER_WEEK);
  }

  private shift(date: Date, days: number): Date {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() + days);

    return shifted;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private fromIso(iso: string): Date {
    const [year, month, day] = iso.split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  private toIso(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
  }
}
