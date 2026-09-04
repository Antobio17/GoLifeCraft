import { VisualMode } from "@shared/visual-preference/domain/models/visual-mode.enum";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";

export type VisualPreferences = Record<VisualSurface, VisualMode>;
