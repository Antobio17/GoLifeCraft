import { Injectable } from "@angular/core";
import { DiaryMacroGoal } from "@shared/design-system/diary-summary/infrastructure/components/diary-summary.component";
import {
  DiaryDayAttributes,
  DiaryEntryView,
  DiaryGoals,
  DiaryMealView,
} from "../../domain/models/diary.model";

@Injectable()
export class DiaryViewService {
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

  goalMacros(attributes: DiaryDayAttributes): DiaryMacroGoal[] {
    const { totals, goals } = attributes;

    return [
      this.macroGoal("Proteínas", totals.protein, goals.protein, "protein"),
      this.macroGoal("Grasas", totals.fat, goals.fat, "fat"),
      this.macroGoal("Hidratos", totals.carbs, goals.carbs, "carbs"),
    ];
  }

  countLabel(count: number): string {
    return `${count} ${count === 1 ? "registro" : "registros"}`;
  }

  remainingFootnote(remaining: number): string {
    return `kcal · quedan ${this.integer(remaining)}`;
  }

  mealMeta(meal: DiaryMealView): string {
    if (meal.entryCount === 0) return "0 kcal";

    const foods = `${meal.entryCount} ${meal.entryCount === 1 ? "alimento" : "alimentos"}`;

    return `${foods} · ${this.integer(meal.totals.calories)} kcal`;
  }

  entryQuantityLabel(entry: DiaryEntryView): string {
    return `${this.format(entry.quantity)} ${entry.unit}`;
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
  ): DiaryMacroGoal {
    return {
      label,
      valueLabel: this.grams(value),
      goalLabel: this.grams(goal),
      percent: goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0,
      tone,
    };
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
