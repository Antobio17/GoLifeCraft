import { Injectable } from "@angular/core";
import { DiaryGoalConfig } from "../../domain/models/diary-goal.model";

export type DiaryGoalMacro = "protein" | "fat" | "carbs";

export interface DiaryGoalForm {
  calories: number;
  proteinPct: number;
  fatPct: number;
  carbsPct: number;
}

@Injectable()
export class DiaryGoalFormService {
  private readonly kcalPerGram: Record<DiaryGoalMacro, number> = {
    protein: 4,
    fat: 9,
    carbs: 4,
  };

  toForm(config: DiaryGoalConfig): DiaryGoalForm {
    return {
      calories: Math.round(config.calories),
      proteinPct: this.toPercent(config.protein, "protein", config.calories),
      fatPct: this.toPercent(config.fat, "fat", config.calories),
      carbsPct: this.toPercent(config.carbs, "carbs", config.calories),
    };
  }

  toConfig(form: DiaryGoalForm): DiaryGoalConfig {
    return {
      calories: form.calories,
      protein: this.toGrams(form.calories, form.proteinPct, "protein"),
      fat: this.toGrams(form.calories, form.fatPct, "fat"),
      carbs: this.toGrams(form.calories, form.carbsPct, "carbs"),
    };
  }

  grams(calories: number, percent: number, macro: DiaryGoalMacro): number {
    return this.toGrams(calories, percent, macro);
  }

  percentTotal(form: DiaryGoalForm): number {
    return form.proteinPct + form.fatPct + form.carbsPct;
  }

  isValid(form: DiaryGoalForm): boolean {
    return form.calories > 0 && this.percentTotal(form) === 100;
  }

  private toGrams(
    calories: number,
    percent: number,
    macro: DiaryGoalMacro,
  ): number {
    return Math.round((calories * percent) / 100 / this.kcalPerGram[macro]);
  }

  private toPercent(
    grams: number,
    macro: DiaryGoalMacro,
    calories: number,
  ): number {
    if (calories <= 0) return 0;

    return Math.round((grams * this.kcalPerGram[macro] * 100) / calories);
  }
}
