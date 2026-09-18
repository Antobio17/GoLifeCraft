import { Injectable } from "@angular/core";
import { ProgressionTargetRow } from "@shared/design-system/progression-editor/infrastructure/components/progression-editor.component";
import { ExerciseSetView } from "../../domain/models/session-detail.model";
import { Progression } from "../../domain/models/progression.model";
import { ProgressionMode } from "../../domain/models/progression-mode.model";
import { SetKind } from "../../domain/models/set-kind.model";

@Injectable({ providedIn: "root" })
export class ProgressionEditorService {
  private readonly defaultIncrementKg = 2.5;

  /**
   * Hay un objetivo por serie efectiva. Si la configuración guardada no coincide
   * con las series que hoy tiene el ejercicio, manda el ejercicio: sobran los que
   * ya no tienen serie y los que faltan arrancan de las repeticiones de la serie.
   */
  targetRows(
    sets: ExerciseSetView[],
    progression: Progression,
  ): ProgressionTargetRow[] {
    return this.effectiveSets(sets).map((set, index) => ({
      index,
      label: `${index + 1}`,
      now: set.reps,
      reps: progression.repTargets[index] ?? set.reps,
    }));
  }

  repTargetsFor(sets: ExerciseSetView[], progression: Progression): number[] {
    return this.targetRows(sets, progression).map((row) => row.reps);
  }

  withMode(
    sets: ExerciseSetView[],
    progression: Progression,
    mode: ProgressionMode,
  ): Progression {
    if (mode === ProgressionMode.None) {
      return { ...progression, mode };
    }

    return {
      mode,
      repTargets: this.repTargetsFor(sets, progression),
      repTolerance: progression.repTolerance,
      incrementKg: progression.incrementKg ?? this.defaultIncrementKg,
    };
  }

  withTarget(
    sets: ExerciseSetView[],
    progression: Progression,
    index: number,
    reps: number,
  ): Progression {
    const repTargets = this.repTargetsFor(sets, progression);

    return {
      ...progression,
      repTargets: repTargets.map((target, position) =>
        position === index ? reps : target,
      ),
    };
  }

  withTolerance(progression: Progression, repTolerance: number): Progression {
    return { ...progression, repTolerance };
  }

  withIncrement(progression: Progression, incrementKg: number): Progression {
    return { ...progression, incrementKg };
  }

  private effectiveSets(sets: ExerciseSetView[]): ExerciseSetView[] {
    return sets.filter((set) => set.kind === SetKind.Effective);
  }
}
