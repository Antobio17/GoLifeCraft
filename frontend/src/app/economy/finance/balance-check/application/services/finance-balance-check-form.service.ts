import { Injectable } from "@angular/core";
import { FinanceBalanceCheck } from "../../domain/models/finance-balance-check.model";
import { FinanceBalanceCheckForm } from "../../domain/models/finance-balance-check-form.model";
import { FinanceBalanceCheckPayload } from "../../domain/models/finance-balance-check-payload.model";

@Injectable()
export class FinanceBalanceCheckFormService {
  empty(accountId: string, checkDate: string): FinanceBalanceCheckForm {
    return { id: null, accountId, checkDate, amount: "", note: "" };
  }

  fromCheck(check: FinanceBalanceCheck): FinanceBalanceCheckForm {
    return {
      id: check.id,
      accountId: check.accountId,
      checkDate: check.checkDate,
      amount: `${check.amount}`,
      note: check.note,
    };
  }

  amountOf(form: FinanceBalanceCheckForm): number {
    const parsed = Number(form.amount.replace(",", "."));

    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
  }

  isValid(form: FinanceBalanceCheckForm): boolean {
    return form.accountId !== "" && form.amount.trim() !== "";
  }

  toPayload(form: FinanceBalanceCheckForm): FinanceBalanceCheckPayload {
    return {
      accountId: form.accountId,
      checkDate: form.checkDate,
      amount: this.amountOf(form),
      note: form.note.trim(),
    };
  }
}
