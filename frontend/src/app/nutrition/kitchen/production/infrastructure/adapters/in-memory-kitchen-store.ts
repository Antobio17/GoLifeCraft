import { Injectable } from "@angular/core";
import { KitchenDay } from "../../domain/models/kitchen-day.model";
import { KitchenDone } from "../../domain/models/kitchen-done.model";
import { KitchenExpected } from "../../domain/models/kitchen-expected.model";
import { KitchenToCook } from "../../domain/models/kitchen-to-cook.model";
import { KitchenWeekDay } from "../../domain/models/kitchen-week-day.model";
import { PackHint } from "../../domain/models/pack-hint.model";
import { ProductionDetail } from "../../domain/models/production-detail.model";
import { ProductionStatus } from "../../domain/models/production-status.model";
import { StartProductionRequest } from "../../domain/models/start-production-request.model";
import { InMemoryProduction } from "./in-memory-production.model";
import { KitchenRecipeSeed } from "./kitchen-recipe-seed.model";

@Injectable()
export class InMemoryKitchenStore {
  private readonly recipes: KitchenRecipeSeed[] = [
    {
      id: "recipe-lentejas",
      name: "Lentejas con chorizo",
      emoji: "🍲",
      servings: 2,
      ingredients: [
        {
          articleId: "article-lentejas",
          name: "Lentejas",
          emoji: "🫘",
          quantity: 240,
          unit: "g",
        },
        {
          articleId: "article-chorizo",
          name: "Chorizo",
          emoji: "🌶️",
          quantity: 100,
          unit: "g",
        },
        {
          articleId: "article-cebolla",
          name: "Cebolla",
          emoji: "🧅",
          quantity: 1,
          unit: "unit",
        },
        {
          articleId: "article-zanahoria",
          name: "Zanahoria",
          emoji: "🥕",
          quantity: 1.5,
          unit: "unit",
        },
        {
          articleId: "article-aceite",
          name: "Aceite de oliva",
          emoji: "🫒",
          quantity: 20,
          unit: "ml",
        },
      ],
      steps: [
        {
          position: 1,
          text: "Pon las lentejas en remojo la noche anterior.",
          minutes: null,
        },
        {
          position: 2,
          text: "Sofríe la cebolla y la zanahoria hasta que estén blandas.",
          minutes: 10,
        },
        {
          position: 3,
          text: "Añade el chorizo y las lentejas escurridas. Cubre con agua.",
          minutes: null,
        },
        {
          position: 4,
          text: "Cuece a fuego bajo hasta que la lenteja esté tierna.",
          minutes: 45,
        },
      ],
      packArticleId: "",
      packUnit: "",
      packQuantity: 0,
    },
    {
      id: "recipe-curry",
      name: "Pollo al curry",
      emoji: "🍗",
      servings: 4,
      ingredients: [
        {
          articleId: "article-pechuga",
          name: "Pechuga de pollo",
          emoji: "🍗",
          quantity: 600,
          unit: "g",
        },
        {
          articleId: "article-coco",
          name: "Leche de coco",
          emoji: "🥥",
          quantity: 400,
          unit: "ml",
        },
        {
          articleId: "article-curry",
          name: "Pasta de curry",
          emoji: "🧄",
          quantity: 3,
          unit: "tablespoon",
        },
        {
          articleId: "article-arroz",
          name: "Arroz basmati",
          emoji: "🍚",
          quantity: 320,
          unit: "g",
        },
      ],
      steps: [],
      packArticleId: "",
      packUnit: "",
      packQuantity: 0,
    },
    {
      id: "recipe-bolonesa",
      name: "Boloñesa",
      emoji: "🥘",
      servings: 2,
      ingredients: [
        {
          articleId: "article-carne-picada",
          name: "Carne picada",
          emoji: "🥩",
          quantity: 250,
          unit: "g",
        },
        {
          articleId: "article-tomate",
          name: "Tomate triturado",
          emoji: "🍅",
          quantity: 400,
          unit: "g",
        },
        {
          articleId: "article-cebolla",
          name: "Cebolla",
          emoji: "🧅",
          quantity: 1,
          unit: "unit",
        },
        {
          articleId: "article-pasta",
          name: "Espaguetis",
          emoji: "🍝",
          quantity: 200,
          unit: "g",
        },
      ],
      steps: [
        {
          position: 1,
          text: "Pocha la cebolla y añade la carne picada hasta que se dore.",
          minutes: 12,
        },
        {
          position: 2,
          text: "Incorpora el tomate triturado y deja reducir a fuego lento.",
          minutes: 25,
        },
        {
          position: 3,
          text: "Cuece los espaguetis y mézclalos con la salsa.",
          minutes: 9,
        },
      ],
      packArticleId: "article-carne-picada",
      packUnit: "bandeja",
      packQuantity: 500,
    },
    {
      id: "recipe-arroz",
      name: "Arroz basmati",
      emoji: "🍚",
      servings: 2,
      ingredients: [
        {
          articleId: "article-arroz",
          name: "Arroz basmati",
          emoji: "🍚",
          quantity: 160,
          unit: "g",
        },
        {
          articleId: "article-agua",
          name: "Agua",
          emoji: "💧",
          quantity: 320,
          unit: "ml",
        },
      ],
      steps: [
        {
          position: 1,
          text: "Lava el arroz hasta que salga claro.",
          minutes: null,
        },
        {
          position: 2,
          text: "Cuece con el doble de agua y deja reposar tapado.",
          minutes: 12,
        },
      ],
      packArticleId: "",
      packUnit: "",
      packQuantity: 0,
    },
    {
      id: "recipe-garbanzos",
      name: "Ensalada de garbanzos",
      emoji: "🥗",
      servings: 2,
      ingredients: [
        {
          articleId: "article-garbanzos",
          name: "Garbanzos cocidos",
          emoji: "🫘",
          quantity: 240,
          unit: "g",
        },
        {
          articleId: "article-tomate-fresco",
          name: "Tomate",
          emoji: "🍅",
          quantity: 2,
          unit: "unit",
        },
        {
          articleId: "article-atun",
          name: "Atún",
          emoji: "🐟",
          quantity: 1,
          unit: "can",
        },
        {
          articleId: "article-aceite",
          name: "Aceite de oliva",
          emoji: "🫒",
          quantity: 20,
          unit: "ml",
        },
      ],
      steps: [],
      packArticleId: "",
      packUnit: "",
      packQuantity: 0,
    },
  ];

  private readonly demand = new Map<string, Map<string, number>>();
  private readonly stock = new Map<string, number>();
  private readonly productions: InMemoryProduction[] = [];
  private sequence = 0;

  constructor() {
    this.seed();
  }

  day(date: string): KitchenDay {
    const demand = this.demand.get(date) ?? new Map<string, number>();
    const toCook: KitchenToCook[] = [];
    const expected: KitchenExpected[] = [];

    demand.forEach((servings, recipeId) => {
      const recipe = this.recipe(recipeId);
      if (!recipe) return;

      const inStock = this.stock.get(recipeId) ?? 0;
      const deficit = Math.max(0, servings - inStock);

      if (deficit > 0) {
        toCook.push({
          recipeId,
          name: recipe.name,
          emoji: recipe.emoji,
          demand: servings,
          inStock,
          deficit,
          ...this.openProduction(recipeId, date),
          ...this.packHint(recipe, deficit),
        });

        return;
      }

      if (inStock <= 0) return;

      expected.push({
        recipeId,
        name: recipe.name,
        emoji: recipe.emoji,
        inStock,
      });
    });

    return {
      date,
      toCook,
      expected,
      done: this.doneOf(date),
      weekDays: this.weekOf(date),
    };
  }

  production(id: string): ProductionDetail | null {
    const production = this.productions.find((item) => item.id === id);
    if (!production) return null;

    const recipe = this.recipe(production.recipeId);
    if (!recipe) return null;

    const factor = production.servingsCooked / recipe.servings;

    return {
      id: production.id,
      recipeId: production.recipeId,
      name: production.nameSnapshot,
      emoji: production.emojiSnapshot,
      cookDate: production.cookDate,
      status: production.status,
      servingsCooked: production.servingsCooked,
      recipeServings: recipe.servings,
      ingredients: recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        quantity: this.round(ingredient.quantity * factor),
      })),
      steps: recipe.steps.map((step) => ({ ...step })),
    };
  }

  start(request: StartProductionRequest): string {
    const recipe = this.recipe(request.recipeId);
    if (!recipe) return "";

    this.sequence += 1;
    const id = `production-${this.sequence}`;

    this.productions.push({
      id,
      recipeId: recipe.id,
      cookDate: request.cookDate,
      status: ProductionStatus.Cooking,
      servingsCooked: request.servingsPlanned,
      nameSnapshot: recipe.name,
      emojiSnapshot: recipe.emoji,
      cookedAt: "",
    });

    return id;
  }

  finish(id: string, servingsCooked: number): void {
    const production = this.productions.find((item) => item.id === id);
    if (!production) return;

    production.status = ProductionStatus.Done;
    production.servingsCooked = servingsCooked;
    production.cookedAt = new Date().toISOString();

    const current = this.stock.get(production.recipeId) ?? 0;
    this.stock.set(production.recipeId, current + servingsCooked);
  }

  discard(id: string): void {
    const index = this.productions.findIndex((item) => item.id === id);
    if (index < 0) return;

    this.productions.splice(index, 1);
  }

  setStock(recipeId: string, servings: number): void {
    this.stock.set(recipeId, Math.max(0, servings));
  }

  private openProduction(
    recipeId: string,
    date: string,
  ): { productionId?: string } {
    const open = this.productions.find(
      (production) =>
        production.recipeId === recipeId &&
        production.cookDate === date &&
        ProductionStatus.Done !== production.status,
    );

    return open ? { productionId: open.id } : {};
  }

  private packHint(
    recipe: KitchenRecipeSeed,
    deficit: number,
  ): { packHint?: PackHint } {
    if (!recipe.packArticleId) return {};

    const ingredient = recipe.ingredients.find(
      (item) => item.articleId === recipe.packArticleId,
    );
    if (!ingredient) return {};

    const perServing = ingredient.quantity / recipe.servings;
    const neededQuantity = this.round(perServing * deficit);
    const suggestedServings = Math.floor(recipe.packQuantity / perServing);

    if (neededQuantity >= recipe.packQuantity) return {};
    if (suggestedServings <= deficit) return {};

    return {
      packHint: {
        articleId: ingredient.articleId,
        articleName: ingredient.name,
        packUnit: recipe.packUnit,
        packQuantity: recipe.packQuantity,
        unit: ingredient.unit,
        neededQuantity,
        suggestedServings,
      },
    };
  }

  private doneOf(date: string): KitchenDone[] {
    return this.productions
      .filter(
        (production) =>
          production.cookDate === date &&
          ProductionStatus.Done === production.status,
      )
      .map((production) => ({
        productionId: production.id,
        recipeId: production.recipeId,
        name: production.nameSnapshot,
        emoji: production.emojiSnapshot,
        servingsCooked: production.servingsCooked,
        cookedAt: production.cookedAt,
      }));
  }

  private weekOf(date: string): KitchenWeekDay[] {
    const monday = this.mondayOf(date);

    return Array.from({ length: 7 }, (_, index) => {
      const iso = this.addDays(monday, index);

      return { date: iso, hasItems: this.hasItems(iso) };
    });
  }

  private hasItems(date: string): boolean {
    if ((this.demand.get(date)?.size ?? 0) > 0) return true;

    return this.productions.some((production) => production.cookDate === date);
  }

  private recipe(recipeId: string): KitchenRecipeSeed | null {
    return this.recipes.find((recipe) => recipe.id === recipeId) ?? null;
  }

  private seed(): void {
    const today = this.todayIso();

    this.setDemand(this.addDays(today, -1), [["recipe-lentejas", 2]]);
    this.setDemand(today, [
      ["recipe-lentejas", 5],
      ["recipe-curry", 4],
      ["recipe-bolonesa", 2],
      ["recipe-garbanzos", 2],
      ["recipe-arroz", 4],
    ]);
    this.setDemand(this.addDays(today, 1), [
      ["recipe-bolonesa", 2],
      ["recipe-lentejas", 3],
    ]);
    this.setDemand(this.addDays(today, 2), [
      ["recipe-arroz", 2],
      ["recipe-curry", 2],
    ]);

    this.stock.set("recipe-lentejas", 2);
    this.stock.set("recipe-garbanzos", 2);
    this.stock.set("recipe-arroz", 4);

    this.sequence += 1;
    this.productions.push({
      id: `production-${this.sequence}`,
      recipeId: "recipe-arroz",
      cookDate: today,
      status: ProductionStatus.Done,
      servingsCooked: 4,
      nameSnapshot: "Arroz basmati",
      emojiSnapshot: "🍚",
      cookedAt: `${today}T13:20:00.000Z`,
    });
  }

  private setDemand(date: string, entries: [string, number][]): void {
    this.demand.set(date, new Map(entries));
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private todayIso(): string {
    return this.toIso(new Date());
  }

  private mondayOf(iso: string): string {
    const date = this.parse(iso);
    const weekday = (date.getDay() + 6) % 7;

    return this.addDays(iso, -weekday);
  }

  private addDays(iso: string, days: number): string {
    const date = this.parse(iso);
    date.setDate(date.getDate() + days);

    return this.toIso(date);
  }

  private parse(iso: string): Date {
    const [year, month, day] = iso.split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  private toIso(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${date.getFullYear()}-${month}-${day}`;
  }
}
