import { Injectable } from "@angular/core";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceBudgetCategoryForm } from "../../domain/models/finance-budget-category-form.model";
import { FinanceBudgetCategoryKind } from "../../domain/models/finance-budget-category-kind.model";
import { FinanceBudgetCategoryPayload } from "../../domain/models/finance-budget-category-payload.model";
import { FinanceBudgetForm } from "../../domain/models/finance-budget-form.model";
import { FinanceBudgetPayload } from "../../domain/models/finance-budget-payload.model";
import { FinanceBudgetSettingsAttributes } from "../../domain/models/finance-budget-settings-attributes.model";

const SAVINGS_STEP = 0.5;
const VARIABLE_STEP = 5;

@Injectable()
export class FinanceBudgetFormService {
  fromSettings(settings: FinanceBudgetSettingsAttributes): FinanceBudgetForm {
    return {
      referenceIncome: settings.referenceIncome
        ? `${settings.referenceIncome}`
        : "",
      savingsPercentage: settings.savingsPercentage,
      categories: settings.categories.map((setting) => ({
        category: setting.category,
        kind: setting.kind,
        amount: setting.amount ? `${setting.amount}` : "",
      })),
    };
  }

  savingsStep(): number {
    return SAVINGS_STEP;
  }

  variableStep(): number {
    return VARIABLE_STEP;
  }

  referenceIncomeOf(form: FinanceBudgetForm): number {
    return this.parseAmount(form.referenceIncome);
  }

  savingsAmountOf(form: FinanceBudgetForm): number {
    return this.round(
      (this.referenceIncomeOf(form) * form.savingsPercentage) / 100,
    );
  }

  amountOf(category: FinanceBudgetCategoryForm): number {
    return this.parseAmount(category.amount);
  }

  allocatedOf(form: FinanceBudgetForm): number {
    const categories = form.categories.reduce(
      (total, category) => total + this.amountOf(category),
      0,
    );

    return this.round(this.savingsAmountOf(form) + categories);
  }

  unassignedOf(form: FinanceBudgetForm): number {
    return this.round(this.referenceIncomeOf(form) - this.allocatedOf(form));
  }

  percentageOf(form: FinanceBudgetForm, amount: number): number {
    const referenceIncome = this.referenceIncomeOf(form);

    return referenceIncome > 0 ? (amount / referenceIncome) * 100 : 0;
  }

  /**
   * El tope al que puede llegar el deslizador de una categoría: lo que ya tiene
   * asignado más lo que queda libre, para que nunca reparta más que el ingreso.
   */
  sliderMaxOf(form: FinanceBudgetForm, index: number): number {
    const current = this.amountOf(form.categories[index]);
    const available = Math.max(0, this.unassignedOf(form));
    const stepped =
      Math.floor((current + available) / VARIABLE_STEP) * VARIABLE_STEP;

    return Math.max(VARIABLE_STEP, current, stepped);
  }

  withReferenceIncome(
    form: FinanceBudgetForm,
    referenceIncome: string,
  ): FinanceBudgetForm {
    return { ...form, referenceIncome };
  }

  withSavingsPercentage(
    form: FinanceBudgetForm,
    savingsPercentage: number,
  ): FinanceBudgetForm {
    return { ...form, savingsPercentage };
  }

  withCategoryKind(
    form: FinanceBudgetForm,
    index: number,
    kind: FinanceBudgetCategoryKind,
  ): FinanceBudgetForm {
    return this.replaceCategory(form, index, (category) => ({
      ...category,
      kind,
    }));
  }

  withCategoryAmount(
    form: FinanceBudgetForm,
    index: number,
    amount: string,
  ): FinanceBudgetForm {
    return this.replaceCategory(form, index, (category) => ({
      ...category,
      amount,
    }));
  }

  isValid(form: FinanceBudgetForm): boolean {
    return this.referenceIncomeOf(form) > 0 && this.unassignedOf(form) >= 0;
  }

  toPayload(form: FinanceBudgetForm): FinanceBudgetPayload {
    return {
      referenceIncome: this.referenceIncomeOf(form),
      savingsPercentage: form.savingsPercentage,
      categories: this.budgetedCategories(form),
    };
  }

  private budgetedCategories(
    form: FinanceBudgetForm,
  ): FinanceBudgetCategoryPayload[] {
    return form.categories
      .filter((category) => this.amountOf(category) > 0)
      .map((category, index) => ({
        category: category.category as FinanceCategory,
        kind: category.kind,
        amount: this.amountOf(category),
        position: index + 1,
      }));
  }

  private replaceCategory(
    form: FinanceBudgetForm,
    index: number,
    change: (category: FinanceBudgetCategoryForm) => FinanceBudgetCategoryForm,
  ): FinanceBudgetForm {
    return {
      ...form,
      categories: form.categories.map((category, position) =>
        position === index ? change(category) : category,
      ),
    };
  }

  private parseAmount(value: string): number {
    const parsed = Number(value.replace(",", "."));

    return Number.isFinite(parsed) && parsed > 0 ? this.round(parsed) : 0;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
