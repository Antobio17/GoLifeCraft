import { Injectable, inject } from "@angular/core";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { AggregateNavigationService } from "@shared/routing/application/services/aggregate-navigation.service";
import { UnitCatalogService } from "@nutrition/catalog/article/application/services/unit-catalog.service";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";
import { InventoryLocation } from "../../domain/models/inventory-location.model";
import { InventoryLocationItem } from "../../domain/models/inventory-location-item.model";
import { InventoryLocationRow } from "../../domain/models/inventory-location-row.model";
import { InventoryItemRow } from "../../domain/models/inventory-item-row.model";
import { InventoryItemUnit } from "../../domain/models/inventory-item-unit.model";
import { InventoryShift } from "../../domain/models/inventory-shift.model";

@Injectable({ providedIn: "root" })
export class InventoryViewService {
  private entityVisual = inject(EntityVisualService);
  private aggregateNavigation = inject(AggregateNavigationService);
  private unitCatalog = inject(UnitCatalogService);

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

  locationRowOf(
    location: InventoryLocation,
    t: (key: string) => string,
  ): InventoryLocationRow {
    return {
      location,
      emoji: location.emoji,
      name: location.name,
      description: this.locationDescription(location, t),
      badges: [
        {
          label: `${location.countedItems}/${location.totalItems}`,
          value: t("getInventory.location.counted"),
        },
        {
          label: `${location.adjustedItems}`,
          value: t("getInventory.location.adjusted"),
        },
      ],
    };
  }

  rowOf(
    item: InventoryLocationItem,
    unit: string,
    t: (key: string) => string,
  ): InventoryItemRow {
    const selected = this.unitOf(item, unit);
    const counted = null !== item.countedQuantity;

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
      quantity: this.inUnit(
        item.countedQuantity ?? item.expectedQuantity,
        selected,
      ),
      unit: selected.unit,
      unitLabel: this.unitLabel(selected.unit),
      unitOptions: this.unitOptions(item),
      countedLabel: counted
        ? `${this.format(this.inUnit(item.countedQuantity ?? 0, selected))} ${this.unitLabel(selected.unit)}`
        : t("getInventory.notCounted"),
      counted,
      openable: this.aggregateNavigation.canOpen(item.kind, item.refId),
    };
  }

  selectedUnit(item: InventoryLocationItem): string {
    return item.countedUnit ?? item.unit;
  }

  format(quantity: number): string {
    return Number.isInteger(quantity)
      ? quantity.toString()
      : quantity.toFixed(2).replace(/0$/, "");
  }

  private unitOptions(item: InventoryLocationItem): SelectOption[] {
    return item.units.map((unit) => ({
      value: unit.unit,
      label: this.unitLabel(unit.unit),
    }));
  }

  private unitOf(item: InventoryLocationItem, unit: string): InventoryItemUnit {
    return (
      item.units.find((candidate) => candidate.unit === unit) ?? {
        unit: item.unit,
        factor: 1,
      }
    );
  }

  private unitLabel(unit: string): string {
    return this.unitCatalog.label(unit);
  }

  private inUnit(quantity: number, unit: InventoryItemUnit): number {
    if (unit.factor <= 0) return quantity;

    return Math.round((quantity / unit.factor) * 100) / 100;
  }

  private locationDescription(
    location: InventoryLocation,
    t: (key: string) => string,
  ): string {
    const items = this.fill(t("getInventory.location.items"), {
      count: String(location.totalItems),
    });

    if (null !== location.locationId) return items;

    return `${t("getInventory.locationGone")} · ${items}`;
  }

  private fill(text: string, replacements: Record<string, string>): string {
    return Object.entries(replacements).reduce(
      (filled, [token, value]) => filled.replace(`{${token}}`, value),
      text,
    );
  }
}
