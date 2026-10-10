import { Injectable } from "@angular/core";
import { MacroShare } from "@shared/design-system/macro-bar/domain/models/macro-share.model";

const KCAL_PER_GRAM_PROTEIN = 4;
const KCAL_PER_GRAM_FAT = 9;
const KCAL_PER_GRAM_CARBS = 4;

@Injectable({ providedIn: "root" })
export class MacroShareService {
  byCalories(protein: number, fat: number, carbs: number): MacroShare {
    const proteinKcal = this.grams(protein) * KCAL_PER_GRAM_PROTEIN;
    const fatKcal = this.grams(fat) * KCAL_PER_GRAM_FAT;
    const carbsKcal = this.grams(carbs) * KCAL_PER_GRAM_CARBS;
    const total = proteinKcal + fatKcal + carbsKcal;

    if (total <= 0) {
      return { protein: 0, fat: 0, carbs: 0 };
    }

    return {
      protein: (proteinKcal / total) * 100,
      fat: (fatKcal / total) * 100,
      carbs: (carbsKcal / total) * 100,
    };
  }

  private grams(value: number): number {
    if (!Number.isFinite(value)) return 0;

    return Math.max(0, value);
  }
}
