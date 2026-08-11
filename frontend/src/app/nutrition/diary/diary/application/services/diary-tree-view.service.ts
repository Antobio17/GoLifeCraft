import { Injectable, inject } from "@angular/core";
import { DiaryTreeRow } from "@shared/design-system/diary-tree/domain/models/diary-tree-row.model";
import { DiaryEntryNodeView } from "../../domain/models/diary.model";
import { DiaryPickerService } from "./diary-picker.service";
import { DiaryViewService, MacroShortLabels } from "./diary-view.service";

export interface DiaryTreeLabels extends MacroShortLabels {
  kcal: string;
  servings: string;
}

@Injectable()
export class DiaryTreeViewService {
  private view = inject(DiaryViewService);
  private picker = inject(DiaryPickerService);

  rows(
    nodes: DiaryEntryNodeView[],
    collapsed: ReadonlySet<string>,
    labels: DiaryTreeLabels,
    depth = 0,
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
      };

      if (!expanded) return [row];

      return [row, ...this.rows(node.children, collapsed, labels, depth + 1)];
    });
  }
}
