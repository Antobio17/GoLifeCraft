export interface ExerciseSetView {
  id: string;
  position: number;
  reps: number;
  weight: number | null;
}

export interface SessionExerciseView {
  id: string;
  exerciseId: string | null;
  exerciseName: string;
  muscleGroups: string[];
  type: string;
  position: number;
  sets: ExerciseSetView[];
}

export interface SessionDetailAttributes {
  name: string;
  estimatedDurationMinutes: number;
  exercises: SessionExerciseView[];
}

export interface SessionDetail {
  id: string;
  type: string;
  attributes: SessionDetailAttributes;
}
