import { Injectable } from "@angular/core";
import { PantryLocationItem } from "../../domain/models/pantry-location-item.model";
import { PantryLocationItemRow } from "../../domain/models/pantry-location-item-row.model";
import { PantryLocationCandidate } from "../../domain/models/pantry-location-candidate.model";
import { PantryLocationCandidateRow } from "../../domain/models/pantry-location-candidate-row.model";

@Injectable({ providedIn: "root" })
export class PantryLocationViewService {
  itemRow(item: PantryLocationItem): PantryLocationItemRow {
    const { emoji, name, quantity, unit } = item.attributes;

    return {
      item,
      title: `${emoji} ${name}`.trim(),
      quantityLabel: `${this.format(quantity)} ${unit}`,
    };
  }

  candidateRow(
    candidate: PantryLocationCandidate,
    placedLabel: (location: string) => string,
    addLabel: string,
    moveLabel: string,
  ): PantryLocationCandidateRow {
    const { emoji, name, quantity, unit, locationName } = candidate.attributes;
    const placed = null !== candidate.attributes.locationId;

    return {
      candidate,
      title: `${emoji} ${name}`.trim(),
      quantityLabel: `${this.format(quantity)} ${unit}`,
      placed,
      placedLabel: placed ? placedLabel(locationName ?? "") : "",
      actionLabel: placed ? moveLabel : addLabel,
    };
  }

  format(quantity: number): string {
    return Number.isInteger(quantity)
      ? quantity.toString()
      : quantity.toFixed(2).replace(/0$/, "");
  }
}
