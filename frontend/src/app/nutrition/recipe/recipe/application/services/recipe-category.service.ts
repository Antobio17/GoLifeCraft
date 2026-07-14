import { Injectable } from "@angular/core";

export enum RecipeCategory {
  Breakfast = "Desayuno",
  Lunch = "Comida",
  Dinner = "Cena",
  Snack = "Snack",
  SauceBase = "Salsa base",
  Dessert = "Postre",
  Drink = "Bebida",
}

@Injectable()
export class RecipeCategoryService {
  categories(): string[] {
    return Object.values(RecipeCategory);
  }
}
