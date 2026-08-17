import { Injectable } from "@angular/core";
import { FinanceAccount } from "../../domain/models/finance-account.model";
import { FinanceAccountForm } from "../../domain/models/finance-account-form.model";
import { FinanceAccountPayload } from "../../domain/models/finance-account-payload.model";
import { FinanceAccountType } from "../../domain/models/finance-account-type.model";

@Injectable()
export class FinanceAccountFormService {
  empty(): FinanceAccountForm {
    return { id: null, name: "", type: FinanceAccountType.BANK };
  }

  fromAccount(account: FinanceAccount): FinanceAccountForm {
    return { id: account.id, name: account.name, type: account.type };
  }

  isValid(form: FinanceAccountForm): boolean {
    return form.name.trim().length > 0;
  }

  toPayload(form: FinanceAccountForm): FinanceAccountPayload {
    return { name: form.name.trim(), type: form.type };
  }
}
