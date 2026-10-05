import { DatedRowTone } from "@shared/design-system/dated-row/domain/models/dated-row-tone.enum";

export interface WorkoutRowView {
  id: string;
  weekday: string;
  day: string;
  title: string;
  tag: string;
  duration: string;
  meta: string;
  ratio: string;
  ratioTone: DatedRowTone;
  progress: number;
  ariaLabel: string;
}
