import { Injectable, signal } from "@angular/core";

const MASK = "••••";

@Injectable({ providedIn: "root" })
export class FinanceAmountPrivacyService {
  private readonly hidden = signal(true);

  readonly amountsHidden = this.hidden.asReadonly();

  toggle(): void {
    this.hidden.update((hidden) => !hidden);
  }

  mask(label: string): string {
    return this.hidden() ? MASK : label;
  }
}
