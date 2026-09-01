export interface ExerciseSetRequest {
  position: number;
  reps: number;
  weight: number | null;
}

export interface SessionExerciseRequest {
  exerciseId: string | null;
  position: number;
  note: string | null;
  sets: ExerciseSetRequest[];
}

export interface CreateSessionRequest {
  sessionId?: string;
  name: string;
  estimatedDurationMinutes: number;
  restSeconds: number;
  exercises: SessionExerciseRequest[];
}
