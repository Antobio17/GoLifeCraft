export interface CreateExerciseRequest {
  name: string;
  type: string;
  muscleGroups: string[];
  icon: string | null;
}
