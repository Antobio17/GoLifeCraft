import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { VisualMode } from "@shared/visual-preference/domain/models/visual-mode.enum";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { UpdateVisualPreferencePort } from "@shared/visual-preference/domain/ports/update-visual-preference.port";

@Injectable()
export class HttpUpdateVisualPreferenceAdapter extends UpdateVisualPreferencePort {
  private http = inject(HttpClient);

  update(surface: VisualSurface, mode: VisualMode): Observable<void> {
    return this.http.put<void>("/api/v1/authorization/me/visual-preference", {
      surface,
      mode,
    });
  }
}
