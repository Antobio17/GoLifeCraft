import { Injectable } from "@angular/core";
import { GlobalArticleDetailAttributes } from "../../domain/models/global-article-detail-attributes.model";
import { GlobalArticleFormValue } from "../../domain/models/global-article-form-value.model";
import { UpdateGlobalArticleRequest } from "../../domain/models/update-global-article-request.model";
import { MacroSplit } from "../../domain/models/macro-split.model";

@Injectable()
export class GlobalArticleFormService {
  toFormValue(
    attributes: GlobalArticleDetailAttributes,
  ): GlobalArticleFormValue {
    return {
      name: attributes.name,
      brand: attributes.brand ?? "",
      categoryName: attributes.categoryName,
      quantity: attributes.quantity ?? "",
      price: this.format(attributes.price),
      previousPrice: this.format(attributes.previousPrice),
      referencePrice: this.format(attributes.referencePrice),
      referenceFormat: attributes.referenceFormat ?? "",
      calories: this.format(attributes.calories),
      protein: this.format(attributes.protein),
      fat: this.format(attributes.fat),
      saturatedFat: this.format(attributes.saturatedFat),
      carbs: this.format(attributes.carbs),
      sugars: this.format(attributes.sugars),
      fiber: this.format(attributes.fiber),
      salt: this.format(attributes.salt),
    };
  }

  toRequest(value: GlobalArticleFormValue): UpdateGlobalArticleRequest {
    return {
      name: value.name.trim(),
      brand: this.text(value.brand),
      categoryName: this.text(value.categoryName),
      quantity: this.text(value.quantity),
      price: this.parse(value.price),
      previousPrice: this.parse(value.previousPrice),
      referencePrice: this.parse(value.referencePrice),
      referenceFormat: this.text(value.referenceFormat),
      calories: this.parse(value.calories),
      protein: this.parse(value.protein),
      carbs: this.parse(value.carbs),
      sugars: this.parse(value.sugars),
      fat: this.parse(value.fat),
      saturatedFat: this.parse(value.saturatedFat),
      fiber: this.parse(value.fiber),
      salt: this.parse(value.salt),
    };
  }

  macroSplit(value: GlobalArticleFormValue): MacroSplit {
    return {
      kcal: this.parse(value.calories),
      protein: this.parse(value.protein),
      fat: this.parse(value.fat),
      carbs: this.parse(value.carbs),
    };
  }

  private parse(value: string | number | null | undefined): number | null {
    if (null === value || undefined === value || "" === value) return null;

    const parsed = Number(String(value).replace(",", ".").trim());

    return Number.isFinite(parsed) ? parsed : null;
  }

  private format(value: number | null): string {
    if (null === value || undefined === value) return "";

    return String(value).replace(".", ",");
  }

  private text(value: string | null | undefined): string | null {
    const trimmed = (value ?? "").trim();

    return "" === trimmed ? null : trimmed;
  }
}
