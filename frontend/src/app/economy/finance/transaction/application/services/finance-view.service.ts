import { Injectable, inject } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";

@Injectable()
export class FinanceViewService {
  private translationService = inject(TranslationService);

  todayIso(): string {
    return this.toIso(new Date());
  }

  currentMonth(): string {
    return this.todayIso().slice(0, 7);
  }

  monthOf(iso: string): string {
    return iso.slice(0, 7);
  }

  shiftMonth(month: string, offset: number): string {
    const [year, monthNumber] = this.splitMonth(month);

    return this.toMonth(new Date(year, monthNumber - 1 + offset, 1));
  }

  isFutureMonth(month: string): boolean {
    return month > this.currentMonth();
  }

  monthLabel(month: string): string {
    const [year, monthNumber] = this.splitMonth(month);
    const label = new Intl.DateTimeFormat(this.locale(), {
      month: "long",
      year: "numeric",
    }).format(new Date(year, monthNumber - 1, 1));

    return this.capitalize(label);
  }

  monthShort(month: string): string {
    const [year, monthNumber] = this.splitMonth(month);

    return new Intl.DateTimeFormat(this.locale(), { month: "short" })
      .format(new Date(year, monthNumber - 1, 1))
      .replace(".", "");
  }

  dayShort(iso: string): string {
    const date = this.parse(iso);
    const month = new Intl.DateTimeFormat(this.locale(), { month: "short" })
      .format(date)
      .replace(".", "");

    return `${date.getDate()} ${month}`;
  }

  dayLong(iso: string): string {
    const date = this.parse(iso);
    const label = new Intl.DateTimeFormat(this.locale(), {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);

    return this.capitalize(label.replace(/\./g, ""));
  }

  nextChargeLabel(chargeDay: number): string {
    const today = new Date();
    const candidate = new Date(
      today.getFullYear(),
      today.getMonth(),
      chargeDay,
    );
    const next =
      candidate <
      new Date(today.getFullYear(), today.getMonth(), today.getDate())
        ? new Date(today.getFullYear(), today.getMonth() + 1, chargeDay)
        : candidate;

    return this.dayShort(this.toIso(next));
  }

  money(amount: number): string {
    return new Intl.NumberFormat(this.locale(), {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  moneyPlain(amount: number): string {
    return new Intl.NumberFormat(this.locale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  moneyShort(amount: number): string {
    return new Intl.NumberFormat(this.locale(), {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  negativeMoney(amount: number): string {
    return `−${this.money(Math.abs(amount))}`;
  }

  signedMoney(amount: number): string {
    const sign = amount >= 0 ? "+" : "−";

    return `${sign}${this.money(Math.abs(amount))}`;
  }

  percentage(value: number): string {
    const sign = value > 0 ? "+" : "";

    return `${sign}${Math.round(value)}%`;
  }

  ratio(amount: number, max: number): number {
    return max <= 0 ? 0 : amount / max;
  }

  private locale(): string {
    return this.translationService.getLocale();
  }

  private parse(iso: string): Date {
    return new Date(`${iso}T00:00:00`);
  }

  private splitMonth(month: string): [number, number] {
    const [year, monthNumber] = month.split("-").map((value) => Number(value));

    return [year, monthNumber];
  }

  private toMonth(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");

    return `${year}-${month}`;
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
