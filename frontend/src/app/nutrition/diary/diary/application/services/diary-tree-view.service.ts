import { Injectable, inject } from "@angular/core";
import { DiaryTreeRow } from "@shared/design-system/diary-tree/domain/models/diary-tree-row.model";
import { DiaryEntryNodeView } from "../../domain/models/diary.model";
import { DiaryLotViewService } from "./diary-lot-view.service";
import { DiaryPickerService } from "./diary-picker.service";
import { DiaryViewService, MacroShortLabels } from "./diary-view.service";

export interface DiaryTreeLabels extends MacroShortLabels {
  kcal: string;
  servings: string;
  lotNone: string;
}

@Injectable()
export class DiaryTreeViewService {
  private view = inject(DiaryViewService);
  private picker = inject(DiaryPickerService);
  private lotView = inject(DiaryLotViewService);

  /**
   * A branch served from a batch already carries what that batch was cooked with, sub-recipes
   * included, so nothing under it is picked again: it is only shown.
   */
  rows(
    nodes: DiaryEntryNodeView[],
    collapsed: ReadonlySet<string>,
    labels: DiaryTreeLabels,
    depth = 0,
    served = false,
  ): DiaryTreeRow[] {
    return nodes.flatMap((node) => {
      const recipe = node.kind === "recipe";
      const expandable = recipe && node.children.length > 0;
      const expanded = expandable && !collapsed.has(node.path);
      const row: DiaryTreeRow = {
        path: node.path,
        depth,
        recipe,
        emoji: node.emoji,
        name: node.name,
        kcalLabel: `${this.view.integer(node.macros.calories)} ${labels.kcal}`,
        macros: this.view.macroItems(node.macros, labels),
        quantity: node.quantity,
        unit: node.unit,
        unitLabel: recipe ? labels.servings : this.picker.unitLabel(node.unit),
        unitOptions: recipe ? [] : this.picker.unitOptions(node.refId),
        expandable,
        expanded,
        lotPickable: recipe && !served,
        lotLabel: this.lotView.entryLabel(
          node.lot,
          served ? "" : labels.lotNone,
        ),
      };

      if (!expanded) return [row];

      return [
        row,
        ...this.rows(
          node.children,
          collapsed,
          labels,
          depth + 1,
          served || null !== node.lot,
        ),
      ];
    });
  }

  findNode(
    nodes: DiaryEntryNodeView[],
    path: string,
  ): DiaryEntryNodeView | null {
    for (const node of nodes) {
      if (node.path === path) return node;

      const found = this.findNode(node.children, path);
      if (null !== found) return found;
    }

    return null;
  }
}
