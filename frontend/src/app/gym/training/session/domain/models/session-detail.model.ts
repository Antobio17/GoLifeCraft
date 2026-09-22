import { Progression } from "./progression.model";
import { SetKind } from "./set-kind.model";

export interface ExerciseSetView {
  id: string;
  position: number;
  reps: number;
  weight: number | null;
  kind: SetKind;
}

export interface SessionExerciseView {
  id: string;
  exerciseId: string | null;
  exerciseName: string;
  muscleGroups: string[];
  type: string;
  weightMode: string;
  position: number;
  note: string | null;
  sets: ExerciseSetView[];
  progression: Progression;
}

export interface SessionDetailAttributes {
  name: string;
  estimatedDurationMinutes: number;
  restSeconds: number;
  progressionEnabled: boolean;
  exercises: SessionExerciseView[];
}

export interface SessionDetail {
  id: string;
  type: string;
  attributes: SessionDetailAttributes;
}
