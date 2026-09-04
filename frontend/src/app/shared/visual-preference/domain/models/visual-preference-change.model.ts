import { VisualMode } from "@shared/visual-preference/domain/models/visual-mode.enum";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";

export interface VisualPreferenceChange {
  surfaces: VisualSurface[];
  mode: VisualMode;
}
