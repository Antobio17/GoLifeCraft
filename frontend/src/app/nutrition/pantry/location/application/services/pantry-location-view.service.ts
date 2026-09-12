import { Injectable, inject } from "@angular/core";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { AggregateNavigationService } from "@shared/routing/application/services/aggregate-navigation.service";
import { PantryLocationItem } from "../../domain/models/pantry-location-item.model";
import { PantryLocationItemRow } from "../../domain/models/pantry-location-item-row.model";
import { PantryLocationCandidate } from "../../domain/models/pantry-location-candidate.model";
import { PantryLocationCandidateRow } from "../../domain/models/pantry-location-candidate-row.model";

@Injectable({ providedIn: "root" })
export class PantryLocationViewService {
  private entityVisual = inject(EntityVisualService);
  private aggregateNavigation = inject(AggregateNavigationService);

  itemRow(item: PantryLocationItem): PantryLocationItemRow {
    const { kind, refId, emoji, name, image, quantity, unit } = item.attributes;

    return {
      item,
      emoji,
      name,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Pantry,
        this.entityVisual.kindOf(kind),
        refId,
        image,
      ),
      openable: this.aggregateNavigation.canOpen(kind, refId),
      quantityLabel: `${this.format(quantity)} ${unit}`,
    };
  }

  candidateRow(candidate: PantryLocationCandidate): PantryLocationCandidateRow {
    const { kind, refId, emoji, name, image, quantity, unit } =
      candidate.attributes;

    return {
      candidate,
      emoji,
      name,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Pantry,
        this.entityVisual.kindOf(kind),
        refId,
        image,
      ),
      quantityLabel: `${this.format(quantity)} ${unit}`,
    };
  }

  format(quantity: number): string {
    return Number.isInteger(quantity)
      ? quantity.toString()
      : quantity.toFixed(2).replace(/0$/, "");
  }
}
