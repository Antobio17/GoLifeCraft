import { Injectable } from "@angular/core";
import { RecipeDetail } from "@nutrition/recipe/recipe/domain/models/recipe.model";
import { ProposalAttributes } from "../../domain/models/proposal-attributes.model";
import { ProposalToCook } from "../../domain/models/proposal-to-cook.model";
import { StartProductionItem } from "../../domain/models/start-production-item.model";

@Injectable()
export class ProposalFormService {
  slotOf(item: ProposalToCook): string {
    return `${item.recipeId}|${item.dueDate ?? ""}`;
  }

  seed(items: ProposalToCook[]): Map<string, number> {
    const servings = new Map<string, number>();

    items.forEach((item) => servings.set(this.slotOf(item), item.deficit));

    return servings;
  }

  selection(items: ProposalToCook[]): ReadonlySet<string> {
    return new Set(items.map((item) => this.slotOf(item)));
  }

  selectionOf(items: ProposalToCook[], recipeId: string): ReadonlySet<string> {
    return new Set(
      items
        .filter((item) => item.recipeId === recipeId)
        .map((item) => this.slotOf(item)),
    );
  }

  withRecipe(
    proposal: ProposalAttributes | null,
    recipe: RecipeDetail | null,
  ): ProposalAttributes | null {
    if (!proposal || !recipe) return proposal;

    if (proposal.toCook.some((item) => item.recipeId === recipe.id)) {
      return proposal;
    }

    const covered = proposal.covered.find(
      (item) => item.recipeId === recipe.id,
    );

    return {
      ...proposal,
      toCook: [
        {
          recipeId: recipe.id,
          name: recipe.attributes.name,
          emoji: recipe.attributes.emoji,
          image: recipe.attributes.image,
          prepMode: recipe.attributes.prepMode,
          dueDate: null,
          demand: covered?.demand ?? 0,
          inStock: covered?.inStock ?? recipe.attributes.stock,
          inProduction: covered?.inProduction ?? 0,
          deficit: Math.max(1, recipe.attributes.servings),
          requiredBy: [],
          packHint: null,
        },
        ...proposal.toCook,
      ],
      covered: proposal.covered.filter((item) => item.recipeId !== recipe.id),
    };
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
