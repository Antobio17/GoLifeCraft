export interface ExerciseSetRequest {
  position: number;
  reps: number;
  weight: number | null;
}

export interface SessionExerciseRequest {
  exerciseId: string | null;
  exerciseName: string;
  muscleGroups: string[];
  type: string;
  position: number;
  sets: ExerciseSetRequest[];
}

export interface CreateSessionRequest {
  name: string;
  estimatedDurationMinutes: number;
  exercises: SessionExerciseRequest[];
}

export type UpdateSessionRequest = CreateSessionRequest;
