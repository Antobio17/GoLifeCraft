import { Observable } from "rxjs";
import { VisualMode } from "@shared/visual-preference/domain/models/visual-mode.enum";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";

export abstract class UpdateVisualPreferencePort {
  abstract update(surface: VisualSurface, mode: VisualMode): Observable<void>;
}
