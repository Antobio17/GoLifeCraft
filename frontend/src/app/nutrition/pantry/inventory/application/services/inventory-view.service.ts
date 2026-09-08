import { Injectable, inject } from "@angular/core";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { InventoryLocation } from "../../domain/models/inventory-location.model";
import { InventoryLocationItem } from "../../domain/models/inventory-location-item.model";
import { InventoryLocationGroup } from "../../domain/models/inventory-location-group.model";
import { InventoryItemRow } from "../../domain/models/inventory-item-row.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";

@Injectable({ providedIn: "root" })
export class InventoryViewService {
  private entityVisual = inject(EntityVisualService);

  shiftKey(shift: InventoryShift | string): string {
    return `inventoryShift.${shift}`;
  }

  statusKey(status: string): string {
    return `inventoryStatus.${status}`;
  }

  dateLabel(countedOn: string): string {
    const [year, month, day] = countedOn.slice(0, 10).split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) return countedOn;

    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  groupOf(
    location: InventoryLocation,
    expectedLabel: (quantity: string, unit: string) => string,
  ): InventoryLocationGroup {
    return {
      location,
      title: `${location.emoji} ${location.name}`.trim(),
      progressLabel: `${location.countedItems}/${location.totalItems}`,
      gone: null === location.locationId,
      rows: location.items.map((item) => this.rowOf(item, expectedLabel)),
    };
  }

  rowOf(
    item: InventoryLocationItem,
    expectedLabel: (quantity: string, unit: string) => string,
  ): InventoryItemRow {
    return {
      item,
      emoji: item.emoji,
      name: item.name,
      imageUrl: this.entityVisual.urlOf(
        VisualSurface.Pantry,
        this.entityVisual.kindOf(item.kind),
        item.refId,
        item.image,
      ),
      expectedLabel: expectedLabel(
        this.format(item.expectedQuantity),
        item.unit,
      ),
      differenceLabel: this.differenceLabel(item),
      differenceTone: this.tone(item.difference),
      counted: null !== item.countedQuantity,
    };
  }

  format(quantity: number): string {
    return Number.isInteger(quantity)
      ? quantity.toString()
      : quantity.toFixed(2).replace(/0$/, "");
  }

  private differenceLabel(item: InventoryLocationItem): string {
    if (null === item.countedQuantity) return "";
    if (0 === item.difference) return "=";

    const sign = item.difference > 0 ? "+" : "−";

    return `${sign}${this.format(Math.abs(item.difference))} ${item.unit}`;
  }

  private tone(difference: number): "up" | "down" | "even" {
    if (difference > 0) return "up";
    if (difference < 0) return "down";

    return "even";
  }
}
