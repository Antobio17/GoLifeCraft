import { Injectable, inject } from "@angular/core";
import {
  MenuDayView,
  MenuDetailAttributes,
  MenuItemKind,
  MenuItemView,
  MenuMacros,
  MenuMealKey,
  MenuType,
  MenuWeekDayKey,
} from "../../domain/models/menu.model";
import {
  CreateMenuRequest,
  MenuItemRequest,
} from "../../domain/models/write-menu.model";
import { MenuPickerService } from "./menu-picker.service";

export interface MenuDraftItem {
  id: string;
  dayKey: MenuWeekDayKey | null;
  meal: MenuMealKey;
  kind: MenuItemKind;
  refId: string;
  quantity: number;
  unit: string | null;
}

export interface MenuDraft {
  type: MenuType;
  name: string;
  emoji: string;
  note: string;
  items: MenuDraftItem[];
}

const MEALS: MenuMealKey[] = ["breakfast", "lunch", "dinner", "snack"];

const WEEK_DAY_KEYS: MenuWeekDayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

const SINGLE_EMOJI = "🍽️";
const WEEK_EMOJI = "🗓️";

@Injectable()
export class MenuDraftService {
  private picker = inject(MenuPickerService);

  empty(type: MenuType): MenuDraft {
    return {
      type,
      name: "",
      emoji: type === "week" ? WEEK_EMOJI : SINGLE_EMOJI,
      note: "",
      items: [],
    };
  }

  withItemAdded(
    draft: MenuDraft,
    dayKey: MenuWeekDayKey | null,
    meal: MenuMealKey,
    kind: MenuItemKind,
    refId: string,
    quantity: number,
    unit: string | null,
  ): MenuDraft {
    const item: MenuDraftItem = {
      id: `draft-${draft.items.length + 1}-${Date.now()}`,
      dayKey,
      meal,
      kind,
      refId,
      quantity,
      unit,
    };

    return { ...draft, items: [...draft.items, item] };
  }

  withItemQuantity(
    draft: MenuDraft,
    itemId: string,
    quantity: number,
  ): MenuDraft {
    return this.withItemPatched(draft, itemId, { quantity });
  }

  withItemUnit(draft: MenuDraft, itemId: string, unit: string): MenuDraft {
    return this.withItemPatched(draft, itemId, { unit });
  }

  withoutItem(draft: MenuDraft, itemId: string): MenuDraft {
    return {
      ...draft,
      items: draft.items.filter((item) => item.id !== itemId),
    };
  }

  isSavable(draft: MenuDraft): boolean {
    return draft.name.trim().length > 0;
  }

  toCreateRequest(draft: MenuDraft): CreateMenuRequest {
    return {
      name: draft.name.trim(),
      emoji: draft.emoji,
      note: draft.note,
      type: draft.type,
      items: draft.items.map(
        (item, index): MenuItemRequest => ({
          dayKey: item.dayKey,
          meal: item.meal,
          kind: item.kind,
          refId: item.refId,
          quantity: item.quantity,
          unit: item.unit,
          position: index + 1,
        }),
      ),
    };
  }

  /**
   * Renders the draft with the same shape the API returns, so the editor screen
   * does not care whether the menu is already persisted.
   */
  toDetail(draft: MenuDraft): MenuDetailAttributes {
    const dayKeys: (MenuWeekDayKey | null)[] =
      draft.type === "week" ? WEEK_DAY_KEYS : [null];
    const days = dayKeys.map((dayKey) => this.buildDay(draft, dayKey));
    const plannedDays = days.filter((day) => day.itemCount > 0);

    const total = days.reduce(
      (macros, day) => this.add(macros, day.totals),
      this.zero(),
    );

    return {
      name: draft.name,
      emoji: draft.emoji,
      note: draft.note,
      type: draft.type,
      weekDays: plannedDays.map((day) => day.dayKey as MenuWeekDayKey),
      days,
      itemCount: draft.items.length,
      total,
      perDay: this.scale(total, 1 / Math.max(1, plannedDays.length)),
    };
  }

  private withItemPatched(
    draft: MenuDraft,
    itemId: string,
    patch: Partial<Pick<MenuDraftItem, "quantity" | "unit">>,
  ): MenuDraft {
    return {
      ...draft,
      items: draft.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    };
  }

  private buildDay(
    draft: MenuDraft,
    dayKey: MenuWeekDayKey | null,
  ): MenuDayView {
    const dayItems = draft.items.filter((item) => item.dayKey === dayKey);
    const meals = MEALS.map((meal) => this.buildMeal(dayItems, meal));

    return {
      dayKey,
      meals,
      itemCount: dayItems.length,
      totals: meals.reduce(
        (macros, meal) => this.add(macros, meal.totals),
        this.zero(),
      ),
    };
  }

  private buildMeal(items: MenuDraftItem[], meal: MenuMealKey) {
    const views = items
      .filter((item) => item.meal === meal)
      .map((item, index) => this.buildItem(item, index));

    return {
      key: meal,
      items: views,
      itemCount: views.length,
      totals: views.reduce(
        (macros, view) => this.add(macros, view.macros),
        this.zero(),
      ),
    };
  }

  private buildItem(item: MenuDraftItem, index: number): MenuItemView {
    const entry = this.picker.entry(item.kind, item.refId);

    return {
      id: item.id,
      dayKey: item.dayKey,
      meal: item.meal,
      kind: item.kind,
      refId: item.refId,
      name: entry.name,
      emoji: entry.emoji,
      image: entry.image,
      quantity: item.quantity,
      unit: item.unit,
      baseUnit: entry.baseUnit,
      position: index + 1,
      macros: this.picker.macros(
        item.kind,
        item.refId,
        item.quantity,
        item.unit,
      ),
      customized: false,
      tree: [],
    };
  }

  private add(left: MenuMacros, right: MenuMacros): MenuMacros {
    return {
      calories: left.calories + right.calories,
      protein: left.protein + right.protein,
      fat: left.fat + right.fat,
      carbs: left.carbs + right.carbs,
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
}
