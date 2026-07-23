export interface DiaryMacros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DiaryGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type DiaryEntryKind = "product" | "recipe" | "quick";

export interface DiaryQuickEntryView {
  name: string;
  emoji: string;
  perUnit: DiaryMacros;
}

export interface DiaryEntryView {
  id: string;
  kind: DiaryEntryKind;
  refId: string | null;
  name: string;
  emoji: string;
  quantity: number;
  unit: string;
  macros: DiaryMacros;
  quick: DiaryQuickEntryView | null;
}

export interface DiaryMealView {
  key: string;
  entryCount: number;
  totals: DiaryMacros;
  entries: DiaryEntryView[];
}

export interface DiaryDayAttributes {
  date: string;
  goals: DiaryGoals;
  totals: DiaryMacros;
  entryCount: number;
  consumedCalories: number;
  goalCalories: number;
  remainingCalories: number;
  percent: number;
  meals: DiaryMealView[];
}

export interface DiaryDay {
  id: string;
  type: string;
  attributes: DiaryDayAttributes;
}
