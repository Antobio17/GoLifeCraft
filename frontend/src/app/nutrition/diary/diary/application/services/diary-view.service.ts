import { Injectable, inject } from "@angular/core";
import { MacroGoal } from "@shared/design-system/macro-panel/domain/models/macro-goal.model";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import {
  DiaryDayAttributes,
  DiaryEntryView,
  DiaryGoals,
  DiaryMealView,
} from "../../domain/models/diary.model";

@Injectable()
export class DiaryViewService {
  private unitCatalog = inject(UnitCatalogService);

  todayIso(): string {
    return this.toIso(new Date());
  }

  addDays(iso: string, days: number): string {
    const date = this.parse(iso);
    date.setDate(date.getDate() + days);
    return this.toIso(date);
  }

  isToday(iso: string): boolean {
    return iso === this.todayIso();
  }

  isFuture(iso: string): boolean {
    return iso > this.todayIso();
  }

  isPast(iso: string): boolean {
    return iso < this.todayIso();
  }

  dateLine(iso: string): string {
    const date = this.parse(iso);
    const weekday = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
    }).format(date);
    const month = new Intl.DateTimeFormat("es-ES", { month: "short" })
      .format(date)
      .replace(".", "");

    return `${this.capitalize(weekday)}, ${date.getDate()} ${month}`;
  }

  navLabel(iso: string): string {
    if (this.isToday(iso)) return "Hoy";

    const date = this.parse(iso);
    const month = new Intl.DateTimeFormat("es-ES", { month: "short" })
      .format(date)
      .replace(".", "");

    return `${date.getDate()} ${month}`;
  }

  integer(value: number | null | undefined): string {
    if (value === null || value === undefined) return "0";

    return this.format(Math.round(value));
  }

  grams(value: number | null | undefined): string {
    if (value === null || value === undefined) return "0 g";

    return `${this.format(value)} g`;
  }

  goalMacros(attributes: DiaryDayAttributes): MacroGoal[] {
    const { totals, goals } = attributes;

    return [
      this.macroGoal("Proteínas", totals.protein, goals.protein, "protein"),
      this.macroGoal("Grasas", totals.fat, goals.fat, "fat"),
      this.macroGoal("Hidratos", totals.carbs, goals.carbs, "carbs"),
    ];
  }

  countLabel(count: number, planning = false): string {
    if (planning) return `${count} ${count === 1 ? "plato" : "platos"}`;

    return `${count} ${count === 1 ? "registro" : "registros"}`;
  }

  caloriesFootnote(attributes: DiaryDayAttributes, planning = false): string {
    const excess = this.excessCalories(attributes);

    if (excess > 0 && planning)
      return `kcal · te pasas ${this.integer(excess)}`;
    if (excess > 0) return `kcal · te has pasado ${this.integer(excess)}`;
    if (planning)
      return `kcal · faltan ${this.integer(attributes.remainingCalories)}`;

    return `kcal · quedan ${this.integer(attributes.remainingCalories)}`;
  }

  exceedsCalories(attributes: DiaryDayAttributes): boolean {
    return this.excessCalories(attributes) > 0;
  }

  mealMeta(meal: DiaryMealView): string {
    if (meal.entryCount === 0) return "0 kcal";

    const foods = `${meal.entryCount} ${meal.entryCount === 1 ? "alimento" : "alimentos"}`;

    return `${foods} · ${this.integer(meal.totals.calories)} kcal`;
  }

  entryUnitLabel(entry: DiaryEntryView): string {
    return this.unitCatalog.label(entry.unit);
  }

  entryQuantityLabel(entry: DiaryEntryView): string {
    return `${this.format(entry.quantity)} ${this.entryUnitLabel(entry)}`;
  }

  entryBadgeTone(kind: string): "brand" | "neutral" | "accent" {
    if (kind === "recipe") return "brand";

    return kind === "quick" ? "accent" : "neutral";
  }

  private macroGoal(
    label: string,
    value: number,
    goal: DiaryGoals[keyof DiaryGoals],
    tone: "protein" | "fat" | "carbs",
  ): MacroGoal {
    const excess = this.excess(value, goal);

    return {
      label,
      valueLabel: this.grams(value),
      goalLabel: this.grams(goal),
      percent: this.reachedPercent(value, goal),
      overPercent: this.excessPercent(value, goal),
      overLabel: excess > 0 ? `+${this.grams(excess)}` : "",
      tone,
    };
  }

  private reachedPercent(value: number, goal: number): number {
    if (goal <= 0) return 0;
    if (value <= goal) return Math.round((value / goal) * 100);

    return Math.round((goal / value) * 100);
  }

  private excessPercent(value: number, goal: number): number {
    if (this.excess(value, goal) === 0) return 0;

    return 100 - this.reachedPercent(value, goal);
  }

  private excess(value: number, goal: number): number {
    if (goal <= 0) return 0;

    return Math.max(0, value - goal);
  }

  private excessCalories(attributes: DiaryDayAttributes): number {
    return this.excess(attributes.consumedCalories, attributes.goalCalories);
  }

  private parse(iso: string): Date {
    return new Date(`${iso}T00:00:00`);
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private format(value: number): string {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  }
}
