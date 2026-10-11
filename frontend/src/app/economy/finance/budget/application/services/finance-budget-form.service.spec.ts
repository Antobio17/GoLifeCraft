import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceBudgetCategoryKind } from "../../domain/models/finance-budget-category-kind.model";
import { FinanceBudgetForm } from "../../domain/models/finance-budget-form.model";
import { FinanceBudgetFormService } from "./finance-budget-form.service";

describe("FinanceBudgetFormService", () => {
  const service = new FinanceBudgetFormService();
  const form: FinanceBudgetForm = {
    referenceIncome: "2780",
    savingsPercentage: 28.5,
    categories: [
      {
        category: FinanceCategory.HOME,
        kind: FinanceBudgetCategoryKind.FIXED,
        amount: "744",
      },
      {
        category: FinanceCategory.GROCERIES,
        kind: FinanceBudgetCategoryKind.VARIABLE,
        amount: "300",
      },
      {
        category: FinanceCategory.BEAUTY,
        kind: FinanceBudgetCategoryKind.FIXED,
        amount: "49,9",
      },
    ],
  };

  it("suma por separado los fijos y los variables", () => {
    expect(service.totalOf(form, FinanceBudgetCategoryKind.FIXED)).toBe(793.9);
    expect(service.totalOf(form, FinanceBudgetCategoryKind.VARIABLE)).toBe(300);
  });

  it("descuenta en cascada el ahorro y luego los fijos", () => {
    expect(service.afterSavingsOf(form)).toBe(1987.7);
    expect(service.afterFixedOf(form)).toBe(1193.8);
    expect(service.unassignedOf(form)).toBe(893.8);
  });

  it("sustituye solo la categoria indicada", () => {
    const changed = service.withCategory(form, 1, {
      category: FinanceCategory.GROCERIES,
      kind: FinanceBudgetCategoryKind.FIXED,
      amount: "120",
    });

    expect(changed.categories[1].kind).toBe(FinanceBudgetCategoryKind.FIXED);
    expect(changed.categories[0]).toBe(form.categories[0]);
    expect(service.totalOf(changed, FinanceBudgetCategoryKind.FIXED)).toBe(
      913.9,
    );
  });
});
