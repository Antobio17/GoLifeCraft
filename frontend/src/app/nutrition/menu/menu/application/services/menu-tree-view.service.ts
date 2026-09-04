import { Injectable, inject } from "@angular/core";
import { AggregateImageKind } from "@shared/aggregate-image/domain/models/aggregate-image-kind.enum";
import { EntityVisualService } from "@shared/entity-visual/application/services/entity-visual.service";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { DiaryTreeRow } from "@shared/design-system/diary-tree/domain/models/diary-tree-row.model";
import { MenuItemNodeView } from "../../domain/models/menu-item-node.model";
import { MenuPickerService } from "./menu-picker.service";
import { MacroLabels, MenuViewService } from "./menu-view.service";

export interface MenuTreeLabels extends MacroLabels {
  kcal: string;
  servings: string;
}

@Injectable()
export class MenuTreeViewService {
  private view = inject(MenuViewService);
  private picker = inject(MenuPickerService);
  private entityVisual = inject(EntityVisualService);

  rows(
    nodes: MenuItemNodeView[],
    collapsed: ReadonlySet<string>,
    labels: MenuTreeLabels,
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
        imageUrl: this.entityVisual.urlOf(
          VisualSurface.Menu,
          recipe ? AggregateImageKind.Recipe : AggregateImageKind.Article,
          node.refId,
          node.image,
        ),
        name: node.name,
        kcalLabel: `${this.view.integer(node.macros.calories)} ${labels.kcal}`,
        macros: this.view.itemMacros(node.macros, labels),
        quantity: node.quantity,
        unit: node.unit,
        unitLabel: recipe ? labels.servings : this.picker.unitLabel(node.unit),
        unitOptions: recipe
          ? []
          : this.picker.unitOptions(node.refId, node.unit),
        expandable,
        expanded,
      };

      if (!expanded) return [row];

      return [row, ...this.rows(node.children, collapsed, labels, depth + 1)];
    });
  }
}
