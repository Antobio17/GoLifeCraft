import { Injectable } from "@angular/core";
import {
  MenuDetailAttributes,
  MenuItemKind,
  MenuItemView,
  MenuMealKey,
  MenuWeekDayKey,
} from "../../domain/models/menu.model";
import {
  MenuItemRequest,
  UpdateMenuRequest,
} from "../../domain/models/write-menu.model";

@Injectable()
export class MenuEditorService {
  toUpdateRequest(detail: MenuDetailAttributes): UpdateMenuRequest {
    return {
      name: detail.name,
      emoji: detail.emoji,
      note: detail.note,
      items: this.toItemRequests(this.flatItems(detail)),
    };
  }

  withName(detail: MenuDetailAttributes, name: string): UpdateMenuRequest {
    return { ...this.toUpdateRequest(detail), name };
  }

  withNote(detail: MenuDetailAttributes, note: string): UpdateMenuRequest {
    return { ...this.toUpdateRequest(detail), note };
  }

  withEmoji(detail: MenuDetailAttributes, emoji: string): UpdateMenuRequest {
    return { ...this.toUpdateRequest(detail), emoji };
  }

  withItemAdded(
    detail: MenuDetailAttributes,
    dayKey: MenuWeekDayKey | null,
    meal: MenuMealKey,
    kind: MenuItemKind,
    refId: string,
    quantity: number,
    unit: string | null,
  ): UpdateMenuRequest {
    const items = this.toItemRequests(this.flatItems(detail));
    items.push({
      dayKey,
      meal,
      kind,
      refId,
      quantity,
      unit,
      position: items.length + 1,
    });

    return { ...this.toUpdateRequest(detail), items };
  }

  withItemQuantityApplied(
    detail: MenuDetailAttributes,
    itemId: string,
    quantity: number,
  ): MenuDetailAttributes {
    return {
      ...detail,
      days: detail.days.map((day) => ({
        ...day,
        meals: day.meals.map((meal) => ({
          ...meal,
          items: meal.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        })),
      })),
    };
  }

  withItemUnit(
    detail: MenuDetailAttributes,
    itemId: string,
    unit: string,
  ): UpdateMenuRequest {
    return this.withItemPatched(detail, itemId, { unit });
  }

  withoutItem(detail: MenuDetailAttributes, itemId: string): UpdateMenuRequest {
    const items = this.flatItems(detail).filter((item) => item.id !== itemId);

    return {
      ...this.toUpdateRequest(detail),
      items: this.toItemRequests(items),
    };
  }

  private withItemPatched(
    detail: MenuDetailAttributes,
    itemId: string,
    patch: Partial<Pick<MenuItemView, "quantity" | "unit">>,
  ): UpdateMenuRequest {
    const items = this.flatItems(detail).map((item) =>
      item.id === itemId ? { ...item, ...patch } : item,
    );

    return {
      ...this.toUpdateRequest(detail),
      items: this.toItemRequests(items),
    };
  }

  private flatItems(detail: MenuDetailAttributes): MenuItemView[] {
    return detail.days.flatMap((day) =>
      day.meals.flatMap((meal) => meal.items),
    );
  }

  private toItemRequests(items: MenuItemView[]): MenuItemRequest[] {
    return items.map((item, index) => ({
      dayKey: item.dayKey,
      meal: item.meal,
      kind: item.kind,
      refId: item.refId,
      quantity: item.quantity,
      unit: item.unit,
      position: index + 1,
    }));
  }
}
