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

export interface DiaryEntryView {
  id: string;
  kind: "product" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  quantity: number;
  unit: string;
  macros: DiaryMacros;
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
