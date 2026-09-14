import { Injectable } from "@angular/core";
import { ProposalToCook } from "../../domain/models/proposal-to-cook.model";
import { StartProductionItem } from "../../domain/models/start-production-item.model";

@Injectable()
export class ProposalFormService {
  slotOf(item: ProposalToCook): string {
    return `${item.recipeId}|${item.dueDate ?? ""}`;
  }

  seed(items: ProposalToCook[]): Map<string, number> {
    const servings = new Map<string, number>();

    items.forEach((item) =>
      servings.set(
        this.slotOf(item),
        item.packHint?.suggestedServings ?? item.deficit,
      ),
    );

    return servings;
  }

  selection(items: ProposalToCook[]): ReadonlySet<string> {
    return new Set(items.map((item) => this.slotOf(item)));
  }

  toItems(
    selected: ReadonlySet<string>,
    servings: ReadonlyMap<string, number>,
  ): StartProductionItem[] {
    const items: StartProductionItem[] = [];

    selected.forEach((slot) => {
      const amount = servings.get(slot) ?? 0;
      if (amount <= 0) return;

      const [recipeId, dueDate] = slot.split("|");
      items.push({ recipeId, servings: amount, dueDate: dueDate || null });
    });

    return items;
  }

  totalServings(
    selected: ReadonlySet<string>,
    servings: ReadonlyMap<string, number>,
  ): number {
    let total = 0;

    selected.forEach((slot) => {
      total += servings.get(slot) ?? 0;
    });

    return Math.round(total * 100) / 100;
  }
}
