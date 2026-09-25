import { ExerciseSetRequest } from "./session-request.model";
import { Progression } from "./progression.model";

export interface SaveSessionExerciseRequest {
  exerciseId: string;
  note: string | null;
  sets: ExerciseSetRequest[];
  progression: Progression;
}
