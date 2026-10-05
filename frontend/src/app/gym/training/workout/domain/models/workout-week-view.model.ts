import { WorkoutRowView } from "./workout-row-view.model";

export interface WorkoutWeekView {
  key: string;
  title: string;
  summary: string;
  rows: WorkoutRowView[];
}
