import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { FinanceAccount } from "./finance-account.model";
import { FinanceBalanceCheckRow } from "@economy/finance/balance-check/domain/models/finance-balance-check-row.model";

export interface FinanceAccountRow {
  account: FinanceAccount;
  glyph: DsGlyph;
  color: string;
  typeLabel: string;
  balanceLabel: string;
  lastCheckLabel: string;
  checks: FinanceBalanceCheckRow[];
}
