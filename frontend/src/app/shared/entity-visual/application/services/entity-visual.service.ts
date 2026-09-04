import { inject } from "@angular/core";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { AggregateImageService } from "@shared/aggregate-image/application/services/aggregate-image.service";
import { VisualPreferenceService } from "@shared/visual-preference/application/services/visual-preference.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";

/**
 * Resolves the picture a screen should paint for an article or a recipe. Returns null whenever the
 * surface is set to icons, the aggregate carries no picture, or the picture has not been downloaded
 * yet, so every caller falls back to its emoji on its own. Reads signals, so calling it from a
 * computed re-runs that computed when the preference changes or the picture lands.
 */
export class EntityVisualService {
  private aggregateImageService = inject(AggregateImageService);
  private visualPreferenceService = inject(VisualPreferenceService);

  urlOf(
    surface: VisualSurface,
    kind: AggregateImageKind,
    id: string | null | undefined,
    image: string | null | undefined,
  ): string | null {
    if (!this.visualPreferenceService.showsImages(surface)) return null;

    if (!id || !image) return null;

    return this.aggregateImageService.objectUrl(kind, id, image)();
  }

  kindOf(kind: string): AggregateImageKind {
    return "recipe" === kind
      ? AggregateImageKind.Recipe
      : AggregateImageKind.Article;
  }
}
