import { Injectable } from "@angular/core";
import { InventoryLine } from "../../domain/models/inventory-line.model";
import { InventoryLineRow } from "../../domain/models/inventory-line-row.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";

@Injectable({ providedIn: "root" })
export class InventoryViewService {
  shiftKey(shift: InventoryShift | string): string {
    return `inventoryShift.${shift}`;
  }

  statusKey(status: string): string {
    return `inventoryStatus.${status}`;
  }

  rowOf(
    line: InventoryLine,
    expectedLabel: (quantity: string, unit: string) => string,
  ): InventoryLineRow {
    const difference = line.difference;

    return {
      line,
      title: `${line.emoji} ${line.name}`.trim(),
      expectedLabel: expectedLabel(
        this.format(line.expectedQuantity),
        line.unit,
      ),
      differenceLabel: this.differenceLabel(line),
      differenceTone: this.tone(difference),
      counted: null !== line.countedQuantity,
    };
  }

  format(quantity: number): string {
    return Number.isInteger(quantity)
      ? quantity.toString()
      : quantity.toFixed(2).replace(/0$/, "");
  }

  private differenceLabel(line: InventoryLine): string {
    if (null === line.countedQuantity) return "";
    if (0 === line.difference) return "=";

    const sign = line.difference > 0 ? "+" : "−";

    return `${sign}${this.format(Math.abs(line.difference))} ${line.unit}`;
  }

  private tone(difference: number): "up" | "down" | "even" {
    if (difference > 0) return "up";
    if (difference < 0) return "down";

    return "even";
  }
}
