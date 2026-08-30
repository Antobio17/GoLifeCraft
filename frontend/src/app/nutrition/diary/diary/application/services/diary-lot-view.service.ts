import { Injectable, inject } from "@angular/core";
import { ProductionLot } from "@nutrition/kitchen/production/domain/models/production-lot.model";
import { DiaryEntryLot } from "../../domain/models/diary-entry-lot.model";
import { DiaryLotRow } from "../../domain/models/diary-lot-row.model";
import { DiaryViewService } from "./diary-view.service";

export interface DiaryLotLabels {
  untitled: string;
  left: (servings: string) => string;
  gone: string;
  changed: string;
}

@Injectable()
export class DiaryLotViewService {
  private view = inject(DiaryViewService);

  entryLabel(lot: DiaryEntryLot | null, fallback: string): string {
    if (null === lot) return fallback;

    const code = lot.code ?? "";

    return "" === lot.label ? code : `${code} · ${lot.label}`;
  }

  rows(
    lots: ProductionLot[],
    selectedId: string | null,
    labels: DiaryLotLabels,
  ): DiaryLotRow[] {
    return lots.map((lot) => ({
      productionItemId: lot.id,
      title: this.title(lot, labels),
      description: this.description(lot, labels),
      selected: lot.id === selectedId,
    }));
  }

  private title(lot: ProductionLot, labels: DiaryLotLabels): string {
    const code = lot.attributes.code ?? labels.untitled;

    return "" === lot.attributes.label
      ? code
      : `${code} · ${lot.attributes.label}`;
  }

  private description(lot: ProductionLot, labels: DiaryLotLabels): string {
    const left = lot.attributes.servingsLeft;
    const servings =
      left > 0 ? labels.left(this.view.decimal(left)) : labels.gone;

    if (!lot.attributes.customized) {
      return `${lot.attributes.cookedOn} · ${servings}`;
    }

    return `${lot.attributes.cookedOn} · ${servings} · ${labels.changed}`;
  }
}
