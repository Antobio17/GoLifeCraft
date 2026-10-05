import { Injectable } from "@angular/core";
import { ExerciseSetView } from "../../domain/models/session-detail.model";
import { ExerciseSetSummary } from "../../domain/models/exercise-set-summary.model";
import { SetKind } from "../../domain/models/set-kind.model";

@Injectable({ providedIn: "root" })
export class ExerciseSetSummaryService {
  summarize(sets: ExerciseSetView[]): ExerciseSetSummary {
    const effective = sets.filter((set) => set.kind === SetKind.Effective);
    const counted = effective.length > 0 ? effective : sets;

    if (counted.length === 0) {
      return { sets: 0, minReps: 0, maxReps: 0, topWeightKg: 0 };
    }

    const reps = counted.map((set) => set.reps);

    return {
      sets: counted.length,
      minReps: Math.min(...reps),
      maxReps: Math.max(...reps),
      topWeightKg: Math.max(0, ...counted.map((set) => set.weight ?? 0)),
    };
  }

  schemeLabel(summary: ExerciseSetSummary): string {
    if (summary.sets === 0) {
      return "—";
    }

    const reps =
      summary.minReps === summary.maxReps
        ? `${summary.maxReps}`
        : `${summary.minReps}-${summary.maxReps}`;

    return `${summary.sets} × ${reps}`;
  }
}
