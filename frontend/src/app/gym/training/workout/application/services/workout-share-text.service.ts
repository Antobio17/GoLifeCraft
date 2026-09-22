import { Injectable, inject } from "@angular/core";
import { ExerciseType } from "@gym/library/exercise/domain/models/exercise-type.model";
import { ExerciseWeightMode } from "@gym/library/exercise/domain/models/exercise-weight-mode.model";
import { SetNumberingService } from "@gym/training/session/application/services/set-numbering.service";
import { SetRowView } from "@gym/training/session/domain/models/set-row-view.model";
import { WorkoutShareLabels } from "../../domain/models/workout-share-labels.model";
import {
  WorkoutDetailAttributes,
  WorkoutExerciseView,
  WorkoutSetView,
} from "../../domain/models/workout-detail.model";

@Injectable({ providedIn: "root" })
export class WorkoutShareTextService {
  private setNumbering = inject(SetNumberingService);

  private static readonly INDENT = "   ";

  build(workout: WorkoutDetailAttributes, labels: WorkoutShareLabels): string {
    const blocks = [
      this.headerBlock(workout, labels),
      ...workout.exercises.map((exercise, index) =>
        this.exerciseBlock(exercise, index + 1, labels),
      ),
    ];

    return blocks.join("\n\n");
  }

  private headerBlock(
    workout: WorkoutDetailAttributes,
    labels: WorkoutShareLabels,
  ): string {
    const completed = this.completedSets(workout);
    const total = this.totalSets(workout);

    return [
      `🏋️ ${workout.sessionName}`,
      `📅 ${this.dateText(workout.startedAt)}`,
      `⏱️ ${this.durationText(workout.durationSeconds)} · ✅ ${completed}/${total} ${labels.sets}`,
    ].join("\n");
  }

  private exerciseBlock(
    exercise: WorkoutExerciseView,
    position: number,
    labels: WorkoutShareLabels,
  ): string {
    const lines = [
      `${position}. ${exercise.exerciseName}${this.tagsText(exercise, labels)}`,
    ];

    this.setNumbering
      .rows(exercise.sets)
      .forEach((row) => lines.push(this.setLine(row, labels)));

    if (!exercise.note) return lines.join("\n");

    lines.push(`${WorkoutShareTextService.INDENT}📝 ${exercise.note}`);

    return lines.join("\n");
  }

  private tagsText(
    exercise: WorkoutExerciseView,
    labels: WorkoutShareLabels,
  ): string {
    const tags = [
      ...exercise.muscleGroups,
      this.typeText(exercise, labels),
      this.weightModeText(exercise, labels),
    ];

    return ` (${tags.join(" · ")})`;
  }

  private setLine(
    row: SetRowView<WorkoutSetView>,
    labels: WorkoutShareLabels,
  ): string {
    const marker = this.setMarker(row);
    const load = this.loadText(row, labels);

    return `${WorkoutShareTextService.INDENT}${marker} ${row.displayLabel} · ${load}`;
  }

  private setMarker(row: SetRowView<WorkoutSetView>): string {
    if (!row.done) return "⬜";
    if (row.warmup) return "🔥";

    return "✅";
  }

  private loadText(
    row: SetRowView<WorkoutSetView>,
    labels: WorkoutShareLabels,
  ): string {
    if (null === row.weight) return `${row.reps} ${labels.reps}`;

    return `${row.reps} × ${row.weight} kg`;
  }

  private typeText(
    exercise: WorkoutExerciseView,
    labels: WorkoutShareLabels,
  ): string {
    if (ExerciseType.Unilateral === exercise.type) return labels.unilateral;

    return labels.bilateral;
  }

  private weightModeText(
    exercise: WorkoutExerciseView,
    labels: WorkoutShareLabels,
  ): string {
    if (ExerciseWeightMode.PerSide === exercise.weightMode) {
      return labels.perSide;
    }

    return labels.totalWeight;
  }

  private completedSets(workout: WorkoutDetailAttributes): number {
    return workout.exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.filter((set) => set.done).length,
      0,
    );
  }

  private totalSets(workout: WorkoutDetailAttributes): number {
    return workout.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
  }

  private dateText(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private durationText(totalSeconds: number): string {
    const seconds = Math.max(0, totalSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}min`;

    return `${minutes}min`;
  }
}
