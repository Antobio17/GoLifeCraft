import { Injectable, inject } from "@angular/core";
import { MacroGoal } from "@shared/design-system/macro-panel/domain/models/macro-goal.model";
import { MacroBadge } from "@shared/design-system/macro-badges/domain/models/macro-badge.model";
import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";
import { StackedBarSegment } from "@shared/design-system/stacked-bar/domain/models/stacked-bar-segment.model";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import {
  DiaryDay,
  DiaryDayAttributes,
  DiaryEntryView,
  DiaryGoals,
  DiaryMacros,
  DiaryMealView,
} from "../../domain/models/diary.model";
import { DiaryEntryKind } from "../../domain/models/diary-entry-kind.model";
import { DiarySummaryStatus } from "../../domain/models/diary-summary-status.enum";
import { DiarySummaryCard } from "../../domain/models/diary-summary-card.model";
import { ChipTone } from "@shared/design-system/chip/infrastructure/components/chip.component";
import { DiaryCalendarViewService } from "./diary-calendar-view.service";

export interface MacroShortLabels {
  protein: string;
  fat: string;
  carbs: string;
}

@Injectable()
export class DiaryViewService {
  private unitCatalog = inject(UnitCatalogService);
  private calendarView = inject(DiaryCalendarViewService);

  withMealConsumed(
    day: DiaryDay,
    mealKey: string,
    consumed: boolean,
  ): DiaryDay {
    return {
      ...day,
      attributes: {
        ...day.attributes,
        meals: day.attributes.meals.map((meal) =>
          meal.key === mealKey
            ? {
                ...meal,
                consumed,
                entries: meal.entries.map((entry) => ({ ...entry, consumed })),
              }
            : meal,
        ),
      },
    };
  }

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

  decimal(value: number | null | undefined): string {
    if (value === null || value === undefined) return "0";

    return this.format(value);
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

  macroStats(attributes: DiaryDayAttributes): StatStripItem[] {
    const { totals, goals } = attributes;

    return this.goalMacros(attributes).map((macro) => ({
      value: this.integer(totals[macro.tone]),
      unit: `/\u00a0${this.integer(goals[macro.tone])}\u00a0g`,
      label: macro.label,
      tone: macro.tone,
    }));
  }

  summaryCard(attributes: DiaryDayAttributes): DiarySummaryCard {
    const status = this.summaryStatus(attributes);

    return {
      statusKey: `getDiary.summary.status.${status}`,
      statusTone: this.summaryTone(status),
      headlineKey: `getDiary.summary.headline.${this.headline(attributes)}`,
      kcal: this.integer(
        Math.abs(attributes.goalCalories - attributes.consumedCalories),
      ),
      over: this.exceedsCalories(attributes),
      caption: {
        consumed: this.integer(attributes.consumedCalories),
        goal: this.integer(attributes.goalCalories),
        percent: this.integer(this.goalShare(attributes)),
      },
      segments: this.calorieSegments(attributes),
      marker: this.calorieGoalMarker(attributes),
      stats: this.macroStats(attributes),
    };
  }

  calorieSegments(attributes: DiaryDayAttributes): StackedBarSegment[] {
    const { totals } = attributes;
    const macros = this.goalMacros(attributes);
    const macroCalories = macros.map(
      (macro) => totals[macro.tone] * this.caloriesPerGram(macro.tone),
    );
    const macroTotal = macroCalories.reduce((sum, value) => sum + value, 0);
    const scale = this.calorieScale(attributes);

    if (macroTotal <= 0 || scale <= 0) return [];

    const consumedShare = (attributes.consumedCalories / scale) * 100;

    return macros.map((macro, index) => ({
      value: (macroCalories[index] / macroTotal) * consumedShare,
      tone: macro.tone,
      label: macro.label,
    }));
  }

  calorieGoalMarker(attributes: DiaryDayAttributes): number | null {
    if (!this.exceedsCalories(attributes)) return null;

    return (attributes.goalCalories / attributes.consumedCalories) * 100;
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

  macroLine(macros: DiaryMacros, labels: MacroShortLabels): string {
    return [
      `${labels.protein} ${this.format(macros.protein)}`,
      `${labels.fat} ${this.format(macros.fat)}`,
      `${labels.carbs} ${this.format(macros.carbs)}`,
    ].join(" · ");
  }

  quantityLabel(entry: DiaryEntryView, servingsLabel: string): string {
    const unit =
      DiaryEntryKind.Recipe === entry.kind
        ? servingsLabel
        : this.entryUnitLabel(entry);

    return `${this.format(entry.quantity)} ${unit}`.trim();
  }

  macroItems(macros: DiaryMacros, labels: MacroShortLabels): MacroBadge[] {
    return [
      { label: labels.protein, value: this.grams(macros.protein) },
      { label: labels.fat, value: this.grams(macros.fat) },
      { label: labels.carbs, value: this.grams(macros.carbs) },
    ];
  }

  findEntry(day: DiaryDay | null, entryId: string): DiaryEntryView | null {
    if (!day) return null;

    for (const meal of day.attributes.meals) {
      const entry = meal.entries.find((candidate) => candidate.id === entryId);
      if (entry) return entry;
    }

    return null;
  }

  withoutEntry(day: DiaryDay | null, entryId: string): DiaryDay | null {
    if (!day) return null;

    const removed = this.findEntry(day, entryId);
    if (!removed) return day;

    const meals = day.attributes.meals.map((meal) =>
      this.mealWithoutEntry(meal, entryId),
    );
    const totals = this.subtractMacros(day.attributes.totals, removed.macros);
    const consumedCalories = Math.round(totals.calories);
    const goalCalories = day.attributes.goalCalories;

    return {
      ...day,
      attributes: {
        ...day.attributes,
        meals,
        totals,
        entryCount: day.attributes.entryCount - 1,
        consumedCalories,
        remainingCalories: Math.max(0, goalCalories - consumedCalories),
        percent: this.consumedPercent(consumedCalories, goalCalories),
      },
    };
  }

  private mealWithoutEntry(
    meal: DiaryMealView,
    entryId: string,
  ): DiaryMealView {
    const removed = meal.entries.find((entry) => entry.id === entryId);
    if (!removed) return meal;

    return {
      ...meal,
      entries: meal.entries.filter((entry) => entry.id !== entryId),
      entryCount: meal.entryCount - 1,
      totals: this.subtractMacros(meal.totals, removed.macros),
    };
  }

  private subtractMacros(
    totals: DiaryMacros,
    macros: DiaryMacros,
  ): DiaryMacros {
    return {
      calories: Math.max(0, totals.calories - macros.calories),
      protein: Math.max(0, totals.protein - macros.protein),
      fat: Math.max(0, totals.fat - macros.fat),
      carbs: Math.max(0, totals.carbs - macros.carbs),
    };
  }

  private consumedPercent(consumed: number, goalCalories: number): number {
    if (goalCalories <= 0) return 0;

    return Math.min(100, Math.round((consumed / goalCalories) * 100));
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
      valueLabel: this.format(value),
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

  private summaryStatus(attributes: DiaryDayAttributes): DiarySummaryStatus {
    const { entryCount, consumedCalories, goalCalories, date } = attributes;

    if (this.isFuture(date))
      return entryCount > 0
        ? DiarySummaryStatus.Planned
        : DiarySummaryStatus.Unplanned;
    if (
      this.isToday(date) &&
      entryCount > 0 &&
      !this.exceedsCalories(attributes)
    )
      return DiarySummaryStatus.InProgress;

    return this.calendarView.dayStatus(
      consumedCalories,
      goalCalories,
      entryCount,
    ) as DiarySummaryStatus;
  }

  private summaryTone(status: DiarySummaryStatus): ChipTone {
    if (status === DiarySummaryStatus.Red) return "danger";
    if (status === DiarySummaryStatus.Orange) return "warning";
    if (status === DiarySummaryStatus.Rest) return "neutral";
    if (status === DiarySummaryStatus.Unplanned) return "neutral";

    return "brand";
  }

  private headline(attributes: DiaryDayAttributes): string {
    const over = this.exceedsCalories(attributes);

    if (this.isFuture(attributes.date)) return over ? "overPlanned" : "missing";
    if (over) return "over";
    if (this.isPast(attributes.date)) return "remainingPast";

    return "remaining";
  }

  private goalShare(attributes: DiaryDayAttributes): number {
    if (attributes.goalCalories <= 0) return 0;

    return (attributes.consumedCalories / attributes.goalCalories) * 100;
  }

  private calorieScale(attributes: DiaryDayAttributes): number {
    return Math.max(attributes.goalCalories, attributes.consumedCalories);
  }

  private caloriesPerGram(tone: MacroGoal["tone"]): number {
    if (tone === "fat") return 9;

    return 4;
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
