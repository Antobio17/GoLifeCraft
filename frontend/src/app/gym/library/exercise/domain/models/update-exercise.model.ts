export interface UpdateExerciseRequest {
  name: string;
  type: string;
  weightMode: string;
  muscleGroups: string[];
  icon: string | null;
}
