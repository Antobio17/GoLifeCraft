import { Progression } from "./progression.model";
import { SetKind } from "./set-kind.model";

export interface ExerciseSetRequest {
  position: number;
  reps: number;
  weight: number | null;
  kind: SetKind;
}

export interface SessionExerciseRequest {
  exerciseId: string | null;
  position: number;
  note: string | null;
  sets: ExerciseSetRequest[];
  progression: Progression;
}

export interface CreateSessionRequest {
  sessionId?: string;
  name: string;
  estimatedDurationMinutes: number;
  restSeconds: number;
  progressionEnabled: boolean;
  exercises: SessionExerciseRequest[];
}
