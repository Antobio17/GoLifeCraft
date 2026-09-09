import { Locator, Page } from "@playwright/test";
import { Ds } from "../../../support/ds";
import { waitForAppReady } from "../../../support/app-ready";

export interface ArticleDraft {
  readonly name: string;
  readonly brand?: string;
  readonly price?: string;
  readonly category?: string;
  readonly store?: string;
  readonly calories?: string;
  readonly protein?: string;
  readonly fat?: string;
  readonly carbs?: string;
}

export class ArticleEditorPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/catalog/create");
    await waitForAppReady(this.page);
  }

  get submit(): Locator {
    return this.ds.button("editor-submit");
  }

  /**
   * `ds-select-chips` no es un `<select>`: pinta un botón por opción, así que
   * se elige por el texto visible y no por el valor del option.
   */
  private async chooseChip(testId: string, label: string): Promise<void> {
    await this.ds.host(testId).getByRole("button", { name: label, exact: true }).click();
  }

  async fill(draft: ArticleDraft): Promise<void> {
    await this.ds.fill("editor-name", draft.name);

    if (draft.brand) {
      await this.ds.fill("editor-brand", draft.brand);
    }

    if (draft.price) {
      await this.ds.fill("editor-price", draft.price);
    }

    if (draft.category) {
      await this.chooseChip("editor-category", draft.category);
    }

    if (draft.store) {
      await this.chooseChip("editor-store", draft.store);
    }

    for (const [field, value] of [
      ["editor-calories", draft.calories],
      ["editor-protein", draft.protein],
      ["editor-fat", draft.fat],
      ["editor-carbs", draft.carbs],
    ] as const) {
      if (value) {
        await this.ds.fill(field, value);
      }
    }
  }

  async save(): Promise<void> {
    await this.submit.click();
  }
}
