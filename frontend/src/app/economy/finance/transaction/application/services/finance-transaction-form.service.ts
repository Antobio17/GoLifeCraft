import { Injectable } from "@angular/core";
import { FinanceCategory } from "../../domain/models/finance-category.model";
import { FinanceTransactionForm } from "../../domain/models/finance-transaction-form.model";
import { FinanceTransactionKind } from "../../domain/models/finance-transaction-kind.model";
import { FinanceTransactionPayload } from "../../domain/models/finance-transaction-payload.model";
import { FinanceTransactionView } from "../../domain/models/finance-transaction-view.model";

@Injectable()
export class FinanceTransactionFormService {
  empty(transactionDate: string, accountId: string): FinanceTransactionForm {
    return {
      id: null,
      accountId,
      kind: FinanceTransactionKind.EXPENSE,
      amount: "",
      category: FinanceCategory.GROCERIES,
      note: "",
      store: "",
      transactionDate,
    };
  }

  fromView(transaction: FinanceTransactionView): FinanceTransactionForm {
    return {
      id: transaction.id,
      accountId: transaction.accountId,
      kind: transaction.kind,
      amount: `${transaction.amount}`,
      category: transaction.category,
      note: transaction.note,
      store: transaction.store ?? "",
      transactionDate: transaction.transactionDate,
    };
  }

  amountOf(form: FinanceTransactionForm): number {
    const parsed = Number(form.amount.replace(",", "."));

    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
  }

  isValid(form: FinanceTransactionForm): boolean {
    return this.amountOf(form) > 0 && form.accountId !== "";
  }

  toPayload(
    form: FinanceTransactionForm,
    fallbackNote: string,
  ): FinanceTransactionPayload {
    const isIncome = form.kind === FinanceTransactionKind.INCOME;
    const note = form.note.trim() || fallbackNote;
    const store = form.store.trim();

    return {
      accountId: form.accountId,
      transactionDate: form.transactionDate,
      kind: form.kind,
      amount: this.amountOf(form),
      category: isIncome ? FinanceCategory.OTHER : form.category,
      note,
      store: store || null,
    };
  }
}
