import { ExerciseSetView } from "./session-detail.model";

export type SetRowView<T extends ExerciseSetView = ExerciseSetView> = T & {
  warmup: boolean;
  displayLabel: string;
};
