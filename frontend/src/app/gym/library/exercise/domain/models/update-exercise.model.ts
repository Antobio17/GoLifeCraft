export interface UpdateExerciseRequest {
  name: string;
  type: string;
  muscleGroups: string[];
  icon: string | null;
}
