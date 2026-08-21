import { Injectable } from "@angular/core";
import {
  MenuDetailAttributes,
  MenuItemView,
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
    return {
      ...detail,
      days: detail.days.map((day) => ({
        ...day,
        meals: day.meals.map((meal) => ({
          ...meal,
          items: meal.items.filter((item) => item.id !== itemId),
        })),
      })),
    };
  }

  flatItems(detail: MenuDetailAttributes | null): MenuItemView[] {
    if (!detail) return [];

    return detail.days.flatMap((day) =>
      day.meals.flatMap((meal) => meal.items),
    );
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
