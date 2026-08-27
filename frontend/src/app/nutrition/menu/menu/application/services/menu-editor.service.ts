import { Injectable } from "@angular/core";
import {
  MenuDayView,
  MenuDetailAttributes,
  MenuItemView,
  MenuMacros,
  MenuMealView,
  MenuWeekDayKey,
} from "../../domain/models/menu.model";

@Injectable()
export class MenuEditorService {
  withItemQuantityApplied(
    detail: MenuDetailAttributes,
    itemId: string,
    quantity: number,
  ): MenuDetailAttributes {
    return this.mapItems(detail, (item) =>
      item.id === itemId ? { ...item, quantity } : item,
    );
  }

  withItemUnitApplied(
    detail: MenuDetailAttributes,
    itemId: string,
    unit: string,
  ): MenuDetailAttributes {
    return this.mapItems(detail, (item) =>
      item.id === itemId ? { ...item, unit } : item,
    );
  }

  withoutItemApplied(
    detail: MenuDetailAttributes,
    itemId: string,
  ): MenuDetailAttributes {
    const removed = this.flatItems(detail).find((item) => item.id === itemId);
    if (!removed) return detail;

    const days = detail.days.map((day) => this.dayWithoutItem(day, itemId));
    const plannedDays = days.filter((day) => day.itemCount > 0);
    const total = this.subtract(detail.total, removed.macros);

    return {
      ...detail,
      days,
      weekDays: plannedDays.map((day) => day.dayKey as MenuWeekDayKey),
      itemCount: detail.itemCount - 1,
      total,
      perDay: this.scale(total, 1 / Math.max(1, plannedDays.length)),
    };
  }

  flatItems(detail: MenuDetailAttributes | null): MenuItemView[] {
    if (!detail) return [];

    return detail.days.flatMap((day) =>
      day.meals.flatMap((meal) => meal.items),
    );
  }

  private dayWithoutItem(day: MenuDayView, itemId: string): MenuDayView {
    const meals = day.meals.map((meal) => this.mealWithoutItem(meal, itemId));

    return {
      ...day,
      meals,
      itemCount: meals.reduce((count, meal) => count + meal.itemCount, 0),
      totals: meals.reduce(
        (macros, meal) => this.add(macros, meal.totals),
        this.zero(),
      ),
    };
  }

  private mealWithoutItem(meal: MenuMealView, itemId: string): MenuMealView {
    const removed = meal.items.find((item) => item.id === itemId);
    if (!removed) return meal;

    return {
      ...meal,
      items: meal.items.filter((item) => item.id !== itemId),
      itemCount: meal.itemCount - 1,
      totals: this.subtract(meal.totals, removed.macros),
    };
  }

  private add(macros: MenuMacros, other: MenuMacros): MenuMacros {
    return {
      calories: macros.calories + other.calories,
      protein: macros.protein + other.protein,
      fat: macros.fat + other.fat,
      carbs: macros.carbs + other.carbs,
    };
  }

  private subtract(macros: MenuMacros, other: MenuMacros): MenuMacros {
    return {
      calories: Math.max(0, macros.calories - other.calories),
      protein: Math.max(0, macros.protein - other.protein),
      fat: Math.max(0, macros.fat - other.fat),
      carbs: Math.max(0, macros.carbs - other.carbs),
    };
  }

  private scale(macros: MenuMacros, factor: number): MenuMacros {
    return {
      calories: macros.calories * factor,
      protein: macros.protein * factor,
      fat: macros.fat * factor,
      carbs: macros.carbs * factor,
    };
  }

  private zero(): MenuMacros {
    return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  }

  private mapItems(
    detail: MenuDetailAttributes,
    patch: (item: MenuItemView) => MenuItemView,
  ): MenuDetailAttributes {
    return {
      ...detail,
      days: detail.days.map((day) => ({
        ...day,
        meals: day.meals.map((meal) => ({
          ...meal,
          items: meal.items.map(patch),
        })),
      })),
    };
  }
}
