import { Injectable } from "@angular/core";
import { FinanceAccount } from "../../domain/models/finance-account.model";
import { FinanceAccountForm } from "../../domain/models/finance-account-form.model";
import { FinanceAccountPayload } from "../../domain/models/finance-account-payload.model";
import { CreateFinanceAccountPayload } from "../../domain/models/create-finance-account-payload.model";
import { FinanceAccountType } from "../../domain/models/finance-account-type.model";

@Injectable()
export class FinanceAccountFormService {
  empty(): FinanceAccountForm {
    return {
      id: null,
      name: "",
      type: FinanceAccountType.BANK,
      balance: "",
    };
  }

  fromAccount(account: FinanceAccount): FinanceAccountForm {
    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: `${account.balance}`,
    };
  }

  balanceOf(form: FinanceAccountForm): number | null {
    if (form.balance.trim() === "") {
      return null;
    }

    const parsed = Number(form.balance.replace(",", "."));

    if (!Number.isFinite(parsed)) {
      return null;
    }

    return Math.round(parsed * 100) / 100;
  }

  isValid(form: FinanceAccountForm): boolean {
    return form.name.trim().length > 0;
  }

  toPayload(form: FinanceAccountForm): FinanceAccountPayload {
    return { name: form.name.trim(), type: form.type };
  }

  toCreatePayload(
    form: FinanceAccountForm,
    balanceDate: string,
  ): CreateFinanceAccountPayload {
    return {
      name: form.name.trim(),
      type: form.type,
      balance: this.balanceOf(form),
      balanceDate,
    };
  }
}
