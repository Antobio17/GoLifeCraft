import { Injectable } from "@angular/core";
import { ExerciseTopSet } from "../../domain/models/exercise-top-set.model";

@Injectable({ providedIn: "root" })
export class ExerciseTopSetFormatService {
  byExerciseId(topSets: ExerciseTopSet[]): Record<string, ExerciseTopSet> {
    return topSets.reduce<Record<string, ExerciseTopSet>>((map, topSet) => {
      map[topSet.exerciseId] = topSet;

      return map;
    }, {});
  }

  valueLabel(topSet: ExerciseTopSet | null): string {
    if (!topSet) {
      return "";
    }

    if (topSet.weightKg <= 0) {
      return `${topSet.reps} reps`;
    }

    return `${this.weightText(topSet.weightKg)} kg × ${topSet.reps}`;
  }

  dateLabel(topSet: ExerciseTopSet | null): string {
    if (!topSet) {
      return "";
    }

    return new Date(topSet.date.replace(" ", "T")).toLocaleDateString(
      undefined,
      { day: "numeric", month: "short" },
    );
  }

  private weightText(weightKg: number): string {
    return weightKg.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
}
