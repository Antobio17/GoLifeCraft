import { TemplateSyncMode } from "./template-sync-mode.model";

export interface WorkoutSetRequest {
  position: number;
  reps: number;
  weight: number | null;
  done: boolean;
}

export interface WorkoutExerciseRequest {
  exerciseId: string | null;
  exerciseName: string;
  type: string;
  muscleGroups: string[];
  position: number;
  note: string | null;
  sets: WorkoutSetRequest[];
}

export interface StartWorkoutRequest {
  workoutId: string;
  sessionId: string | null;
  sessionName: string;
  exercises: WorkoutExerciseRequest[];
}

export interface WorkoutProgressRequest {
  exercises: WorkoutExerciseRequest[];
  durationSeconds: number;
  sessionName?: string;
  restStartedAt: string | null;
}

export interface FinishWorkoutRequest extends WorkoutProgressRequest {
  templateSyncMode: TemplateSyncMode;
  sessionId?: string | null;
}
