import { Injectable } from "@angular/core";
import { DiaryEntryView } from "../../domain/models/diary.model";
import { QuickDiaryEntryPayload } from "../../domain/models/quick-diary-entry.model";

export interface QuickDiaryEntryForm {
  name: string;
  emoji: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
}

const DEFAULT_EMOJI = "✏️";

@Injectable()
export class QuickDiaryEntryFormService {
  readonly emojis = [
    DEFAULT_EMOJI,
    "🍽️",
    "🥪",
    "🥤",
    "🍫",
    "🍎",
    "🍔",
    "🍕",
    "🍰",
    "☕",
    "🍺",
    "🍜",
  ];

  empty(): QuickDiaryEntryForm {
    return {
      name: "",
      emoji: DEFAULT_EMOJI,
      calories: "",
      protein: "",
      fat: "",
      carbs: "",
    };
  }

  fromEntry(entry: DiaryEntryView): QuickDiaryEntryForm {
    if (!entry.quick) return this.empty();

    return {
      name: entry.quick.name,
      emoji: entry.quick.emoji || DEFAULT_EMOJI,
      calories: this.text(entry.quick.perUnit.calories),
      protein: this.text(entry.quick.perUnit.protein),
      fat: this.text(entry.quick.perUnit.fat),
      carbs: this.text(entry.quick.perUnit.carbs),
    };
  }

  hasName(form: QuickDiaryEntryForm): boolean {
    return form.name.trim().length > 0;
  }

  hasCalories(form: QuickDiaryEntryForm): boolean {
    return this.number(form.calories) > 0;
  }

  isValid(form: QuickDiaryEntryForm): boolean {
    return this.hasName(form) && this.hasCalories(form);
  }

  toPayload(
    form: QuickDiaryEntryForm,
    quantity: number,
  ): QuickDiaryEntryPayload {
    return {
      quantity,
      name: form.name.trim(),
      emoji: form.emoji || DEFAULT_EMOJI,
      calories: this.number(form.calories),
      protein: this.number(form.protein),
      fat: this.number(form.fat),
      carbs: this.number(form.carbs),
    };
  }

  private number(value: string): number {
    const parsed = Number.parseFloat(value.replace(",", "."));

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  private text(value: number): string {
    return value > 0 ? String(value) : "";
  }
}
