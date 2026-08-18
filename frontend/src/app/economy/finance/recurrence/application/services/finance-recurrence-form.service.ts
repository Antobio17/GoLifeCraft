import { Injectable } from "@angular/core";
import { FinanceCategory } from "@economy/finance/transaction/domain/models/finance-category.model";
import { FinanceTransactionKind } from "@economy/finance/transaction/domain/models/finance-transaction-kind.model";
import { FinanceRecurrence } from "../../domain/models/finance-recurrence.model";
import { FinanceRecurrenceForm } from "../../domain/models/finance-recurrence-form.model";
import { FinanceRecurrencePayload } from "../../domain/models/finance-recurrence-payload.model";

@Injectable()
export class FinanceRecurrenceFormService {
  empty(
    accountId: string,
    startMonth: string,
    dayOfMonth: number,
  ): FinanceRecurrenceForm {
    return {
      id: null,
      accountId,
      kind: FinanceTransactionKind.INCOME,
      amount: "",
      category: FinanceCategory.BILLS,
      note: "",
      store: "",
      dayOfMonth,
      startMonth,
      endMonth: "",
      active: true,
    };
  }

  fromRecurrence(recurrence: FinanceRecurrence): FinanceRecurrenceForm {
    return {
      id: recurrence.id,
      accountId: recurrence.accountId,
      kind: recurrence.kind,
      amount: `${recurrence.amount}`,
      category: recurrence.category,
      note: recurrence.note,
      store: recurrence.store ?? "",
      dayOfMonth: recurrence.dayOfMonth,
      startMonth: recurrence.startMonth,
      endMonth: recurrence.endMonth ?? "",
      active: recurrence.active,
    };
  }

  amountOf(form: FinanceRecurrenceForm): number {
    const parsed = Number(form.amount.replace(",", "."));

    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
  }

  isValid(form: FinanceRecurrenceForm): boolean {
    if (form.accountId === "" || this.amountOf(form) <= 0) {
      return false;
    }

    if (form.dayOfMonth < 1 || form.dayOfMonth > 31) {
      return false;
    }

    if (!this.isMonth(form.startMonth)) {
      return false;
    }

    if (form.endMonth === "") {
      return true;
    }

    return this.isMonth(form.endMonth) && form.endMonth >= form.startMonth;
  }

  toPayload(
    form: FinanceRecurrenceForm,
    fallbackNote: string,
  ): FinanceRecurrencePayload {
    const isIncome = form.kind === FinanceTransactionKind.INCOME;
    const store = form.store.trim();

    return {
      accountId: form.accountId,
      kind: form.kind,
      amount: this.amountOf(form),
      category: isIncome ? FinanceCategory.OTHER : form.category,
      note: form.note.trim() || fallbackNote,
      store: store || null,
      dayOfMonth: form.dayOfMonth,
      startMonth: form.startMonth,
      endMonth: form.endMonth || null,
      active: form.active,
    };
  }

  private isMonth(month: string): boolean {
    return /^\d{4}-\d{2}$/.test(month);
  }
}
