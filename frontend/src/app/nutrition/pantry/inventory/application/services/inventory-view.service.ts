import { Injectable } from "@angular/core";
import { InventoryLocation } from "../../domain/models/inventory-location.model";
import { InventoryLocationItem } from "../../domain/models/inventory-location-item.model";
import { InventoryLocationGroup } from "../../domain/models/inventory-location-group.model";
import { InventoryItemRow } from "../../domain/models/inventory-item-row.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";

@Injectable({ providedIn: "root" })
export class InventoryViewService {
  shiftKey(shift: InventoryShift | string): string {
    return `inventoryShift.${shift}`;
  }

  statusKey(status: string): string {
    return `inventoryStatus.${status}`;
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
      title: `${item.emoji} ${item.name}`.trim(),
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
