export interface FinanceBalanceCheck {
  id: string;
  accountId: string;
  accountName: string;
  checkDate: string;
  amount: number;
  note: string;
  expectedAmount: number;
  drift: number;
}
