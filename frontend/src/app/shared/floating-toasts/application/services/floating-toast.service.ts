import { Signal, signal } from "@angular/core";
import { Subscription, timer } from "rxjs";
import {
  FloatingToastMessage,
  FloatingToastType,
} from "../../domain/models/floating-toast.model";

const SUCCESS_DURATION_MS = 1200;
const DEFAULT_DURATION_MS = 2000;

export class FloatingToastService {
  private readonly toast = signal<FloatingToastMessage | null>(null);
  private readonly sequence = signal(0);
  private expiry?: Subscription;

  showToast(toastMessage: FloatingToastMessage): void {
    this.expiry?.unsubscribe();

    this.toast.set(toastMessage);
    this.sequence.update((value) => value + 1);

    this.expiry = timer(this.durationOf(toastMessage)).subscribe(() =>
      this.dismiss(),
    );
  }

  dismiss(): void {
    this.expiry?.unsubscribe();
    this.toast.set(null);
  }

  getToast(): Signal<FloatingToastMessage | null> {
    return this.toast.asReadonly();
  }

  getSequence(): Signal<number> {
    return this.sequence.asReadonly();
  }

  typeOf(message: FloatingToastMessage): FloatingToastType {
    if (message.type) return message.type;
    if (message.status >= 200 && message.status < 300) return "success";

    return "error";
  }

  durationOf(message: FloatingToastMessage): number {
    return "success" === this.typeOf(message)
      ? SUCCESS_DURATION_MS
      : DEFAULT_DURATION_MS;
  }
}
