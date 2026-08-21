import { ExerciseSetRequest } from "./session-request.model";

export interface SaveSessionExerciseRequest {
  exerciseId: string;
  note: string | null;
  sets: ExerciseSetRequest[];
}
