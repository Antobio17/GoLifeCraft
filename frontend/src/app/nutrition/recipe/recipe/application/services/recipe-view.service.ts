import { Injectable } from "@angular/core";
import {
  RecipeDetail,
  RecipeIngredientView,
  RecipeListItem,
  RecipeMacros,
} from "../../domain/models/recipe.model";

export interface RecipeCardView {
  id: string;
  emoji: string;
  name: string;
  category: string;
  meta: string;
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
  hasSubRecipe: boolean;
}

const FALLBACK_EMOJI = "🍲";

@Injectable()
export class RecipeViewService {
  integer(value: number | null | undefined): string {
    if (value === null || value === undefined) return "0";

    return this.format(Math.round(value));
  }

  decimal(value: number | null | undefined): string {
    if (value === null || value === undefined) return "0";

    return this.format(value);
  }

  grams(value: number | null | undefined): string {
    return `${this.decimal(value)} g`;
  }

  servingsLabel(servings: number): string {
    return `${servings} ${servings === 1 ? "ración" : "raciones"}`;
  }

  ingredientsLabel(count: number): string {
    return `${count} ${count === 1 ? "ingrediente" : "ingredientes"}`;
  }

  toCard(recipe: RecipeListItem): RecipeCardView {
    const a = recipe.attributes;

    return {
      id: recipe.id,
      emoji: a.emoji || FALLBACK_EMOJI,
      name: a.name,
      category: a.category,
      meta: `${a.category} · ${this.servingsLabel(a.servings)} · ${this.ingredientsLabel(a.ingredientCount)}`,
      kcal: this.integer(a.perServing.calories),
      protein: this.grams(a.perServing.protein),
      fat: this.grams(a.perServing.fat),
      carbs: this.grams(a.perServing.carbs),
      hasSubRecipe: a.hasSubRecipe,
    };
  }

  ingredientQuantityLabel(ingredient: RecipeIngredientView): string {
    return `${this.decimal(ingredient.quantity)} ${ingredient.unit}`;
  }

  perServingMacros(recipe: RecipeDetail): RecipeMacros {
    return recipe.attributes.perServing;
  }

  private format(value: number): string {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  }
}
