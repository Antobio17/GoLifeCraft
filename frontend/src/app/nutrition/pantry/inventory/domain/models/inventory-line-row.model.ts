import { InventoryLine } from "./inventory-line.model";

export interface InventoryLineRow {
  line: InventoryLine;
  title: string;
  expectedLabel: string;
  differenceLabel: string;
  differenceTone: "up" | "down" | "even";
  counted: boolean;
}
