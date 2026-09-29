import { DsGlyph } from "@shared/design-system/glyph/domain/models/ds-glyph.enum";
import { TransactionRowTag } from "@shared/design-system/transaction-row/domain/models/transaction-row-tag.model";
import { FinanceTransactionView } from "./finance-transaction-view.model";

export interface FinanceMovementRow {
  transaction: FinanceTransactionView;
  glyph: DsGlyph;
  glyphColor: string;
  title: string;
  subtitle: string;
  amountLabel: string;
  income: boolean;
  tags: TransactionRowTag[];
}
