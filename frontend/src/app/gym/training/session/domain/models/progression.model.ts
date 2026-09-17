import { ProgressionMode } from "./progression-mode.model";

export interface Progression {
  mode: ProgressionMode;
  repTargets: number[];
  repTolerance: number;
  incrementKg: number | null;
}
