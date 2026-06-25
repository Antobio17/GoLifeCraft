import { Signal, signal } from "@angular/core";
import { FloatingToastMessage } from "../../domain/models/floating-toast.model";

export class FloatingToastService {
  private readonly toast = signal<FloatingToastMessage | null>(null);

  showToast(toastMessage: FloatingToastMessage): void {
    this.toast.set(toastMessage);
  }

  getToast(): Signal<FloatingToastMessage | null> {
    return this.toast.asReadonly();
  }
}
