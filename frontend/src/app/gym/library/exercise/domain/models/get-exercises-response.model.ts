import { Exercise } from "./exercise.model";

export interface GetExercisesMeta {
  pageNumber: number;
  pageSize: number;
  total: number;
}

export interface GetExercisesResponse {
  meta: GetExercisesMeta;
  data: Exercise[];
}
