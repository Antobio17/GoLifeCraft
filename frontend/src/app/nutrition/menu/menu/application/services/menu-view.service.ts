import { Injectable } from "@angular/core";
import { MacroGoal } from "@shared/design-system/macro-panel/domain/models/macro-goal.model";
import { WeekDayTab } from "@shared/design-system/week-day-tabs/domain/models/week-day-tab.model";
import { DiaryGoalConfig } from "@nutrition/diary/goal/domain/models/diary-goal.model";
import {
  MenuDayView,
  MenuDetailAttributes,
  MenuItemView,
  MenuMacros,
  MenuWeekDayKey,
} from "../../domain/models/menu.model";

export interface MacroLabels {
  protein: string;
  fat: string;
  carbs: string;
}

const WEEK_DAY_KEYS: MenuWeekDayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

@Injectable()
export class MenuViewService {
  weekDayKeys(): MenuWeekDayKey[] {
    return [...WEEK_DAY_KEYS];
  }

  integer(value: number | null | undefined): string {
    if (value === null || value === undefined) return "0";

    return this.format(Math.round(value));
  }

  grams(value: number | null | undefined): string {
    if (value === null || value === undefined) return "0 g";

    return `${this.format(value)} g`;
  }

  todayIso(): string {
    return this.toIso(new Date());
  }

  addDays(iso: string, days: number): string {
    const date = this.parse(iso);
    date.setDate(date.getDate() + days);

    return this.toIso(date);
  }

  nextMondayIso(): string {
    const today = new Date();
    const weekday = today.getDay();
    const offset = (8 - (weekday === 0 ? 7 : weekday)) % 7 || 7;

    return this.addDays(this.toIso(today), offset);
  }

  dayCountBetween(fromIso: string, toIso: string): number {
    const from = this.parse(fromIso).getTime();
    const to = this.parse(toIso).getTime();
    const span = Math.abs(to - from);

    return Math.round(span / 86400000) + 1;
  }

  dayShortLabel(iso: string): string {
    const date = this.parse(iso);
    const weekday = new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
    })
      .format(date)
      .replace(".", "");
    const month = new Intl.DateTimeFormat("es-ES", { month: "short" })
      .format(date)
      .replace(".", "");

    return `${this.capitalize(weekday)} ${date.getDate()} ${month}`;
  }

  weekDateIso(weekStartIso: string, dayKey: MenuWeekDayKey): string {
    return this.addDays(weekStartIso, WEEK_DAY_KEYS.indexOf(dayKey));
  }

  dayTabs(
    detail: MenuDetailAttributes,
    selectedDayKey: MenuWeekDayKey | null,
    labels: Record<string, string>,
  ): WeekDayTab[] {
    return WEEK_DAY_KEYS.map((key) => {
      const day = this.findDay(detail, key);

      const hasItems = (day?.itemCount ?? 0) > 0;

      return {
        key,
        label: labels[key] ?? key,
        enabled: hasItems,
        active: key === selectedDayKey,
        hasItems,
      };
    });
  }

  findDay(
    detail: MenuDetailAttributes,
    dayKey: MenuWeekDayKey | null,
  ): MenuDayView | null {
    return detail.days.find((day) => day.dayKey === dayKey) ?? null;
  }

  firstPlannedDayKey(detail: MenuDetailAttributes): MenuWeekDayKey | null {
    return (
      detail.days.find((day) => day.itemCount > 0)?.dayKey ??
      detail.days[0]?.dayKey ??
      null
    );
  }

  goalMacros(
    macros: MenuMacros,
    goal: DiaryGoalConfig | null,
    labels: MacroLabels,
  ): MacroGoal[] {
    return [
      this.macroGoal(labels.protein, macros.protein, goal?.protein, "protein"),
      this.macroGoal(labels.fat, macros.fat, goal?.fat, "fat"),
      this.macroGoal(labels.carbs, macros.carbs, goal?.carbs, "carbs"),
    ];
  }

  reachedPercent(value: number, goal: number | undefined): number {
    if (!goal || goal <= 0) return 0;
    if (value <= goal) return Math.round((value / goal) * 100);

    return Math.round((goal / value) * 100);
  }

  excess(value: number, goal: number | undefined): number {
    if (!goal || goal <= 0) return 0;

    return Math.max(0, value - goal);
  }

  remaining(value: number, goal: number | undefined): number {
    if (!goal || goal <= 0) return 0;

    return Math.max(0, goal - value);
  }

  itemQuantityLabel(item: MenuItemView, unitLabel: string): string {
    return `${this.format(item.quantity)} ${unitLabel}`;
  }

  private macroGoal(
    label: string,
    value: number,
    goal: number | undefined,
    tone: "protein" | "fat" | "carbs",
  ): MacroGoal {
    const excess = this.excess(value, goal);

    return {
      label,
      valueLabel: goal ? this.format(value) : this.grams(value),
      goalLabel: goal ? this.grams(goal) : "",
      percent: this.reachedPercent(value, goal),
      overPercent: this.excessPercent(value, goal),
      overLabel: excess > 0 ? `+${this.grams(excess)}` : "",
      tone,
    };
  }

  private excessPercent(value: number, goal: number | undefined): number {
    if (this.excess(value, goal) === 0) return 0;

    return 100 - this.reachedPercent(value, goal);
  }

  private format(value: number): string {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
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
