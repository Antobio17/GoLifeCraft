import { Injectable } from "@angular/core";
import { ProposalToCook } from "../../domain/models/proposal-to-cook.model";
import { StartProductionItem } from "../../domain/models/start-production-item.model";

@Injectable()
export class ProposalFormService {
  seed(items: ProposalToCook[]): Map<string, number> {
    const servings = new Map<string, number>();

    items.forEach((item) =>
      servings.set(
        item.recipeId,
        item.packHint?.suggestedServings ?? item.deficit,
      ),
    );

    return servings;
  }

  selection(items: ProposalToCook[]): ReadonlySet<string> {
    return new Set(items.map((item) => item.recipeId));
  }

  toItems(
    selected: ReadonlySet<string>,
    servings: ReadonlyMap<string, number>,
  ): StartProductionItem[] {
    const items: StartProductionItem[] = [];

    selected.forEach((recipeId) => {
      const amount = servings.get(recipeId) ?? 0;
      if (amount <= 0) return;

      items.push({ recipeId, servings: amount });
    });

    return items;
  }

  totalServings(
    selected: ReadonlySet<string>,
    servings: ReadonlyMap<string, number>,
  ): number {
    let total = 0;

    selected.forEach((recipeId) => {
      total += servings.get(recipeId) ?? 0;
    });

    return Math.round(total * 100) / 100;
  }
}
