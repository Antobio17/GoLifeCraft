export interface WorkoutSetView {
  id: string;
  position: number;
  reps: number;
  weight: number | null;
  done: boolean;
}

export interface WorkoutExerciseView {
  id: string;
  exerciseId: string | null;
  exerciseName: string;
  muscleGroups: string[];
  type: string;
  position: number;
  note: string | null;
  sets: WorkoutSetView[];
}

export interface WorkoutDetailAttributes {
  sessionId: string | null;
  sessionName: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationSeconds: number;
  exercises: WorkoutExerciseView[];
}

export interface WorkoutDetail {
  id: string;
  type: string;
  attributes: WorkoutDetailAttributes;
}

export interface WorkoutDetailResponse {
  data: WorkoutDetail;
}
