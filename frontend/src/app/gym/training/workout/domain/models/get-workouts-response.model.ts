import { Workout } from "./workout.model";

export interface GetWorkoutsMeta {
  pageNumber: number;
  pageSize: number;
  total: number;
}

export interface GetWorkoutsResponse {
  meta: GetWorkoutsMeta;
  data: Workout[];
}
