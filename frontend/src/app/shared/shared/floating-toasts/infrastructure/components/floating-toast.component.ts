import { Component, DestroyRef, effect, inject } from "@angular/core";
import { trigger, style, animate, transition } from "@angular/animations";
import { FloatingToastService } from "../../application/services/floating-toast.service";
import { FloatingToastMessage } from "../../domain/models/floating-toast.model";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "app-floating-toast",
  templateUrl: "./floating-toast.component.html",
  styleUrls: ["./floating-toast.component.css"],
  animations: [
    trigger("toastSlide", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(-120%)" }),
        animate(
          "420ms cubic-bezier(0.34,1.4,0.64,1)",
          style({ opacity: 1, transform: "translateY(0)" }),
        ),
      ]),
      transition(":leave", [
        animate(
          "280ms cubic-bezier(0.4,0,1,1)",
          style({ opacity: 0, transform: "translateY(-120%)" }),
        ),
      ]),
    ]),
  ],
  imports: [ContextualTranslatePipe],
})
export class FloatingToastComponent {
  private floatingToastService = inject(FloatingToastService);
  private destroyRef = inject(DestroyRef);

  toast: FloatingToastMessage | null = null;
  visible = false;
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timeoutId));

    effect(() => {
      const newToast = this.floatingToastService.getToast()();
      if (!newToast) return;
      this.toast = newToast;
      this.show();
    });
  }

  isSuccess(): boolean {
    return !!this.toast && this.toast.status >= 200 && this.toast.status < 300;
  }

  asParams(
    details: Record<string, unknown> | unknown[],
  ): Record<string, unknown> | undefined {
    if (!details || Array.isArray(details)) return undefined;
    return details;
  }

  show(): void {
    this.visible = true;
    clearTimeout(this.timeoutId);
    const duration = this.isSuccess() ? 3500 : 6000;
    this.timeoutId = setTimeout(() => {
      this.visible = false;
    }, duration);
  }

  dismiss(): void {
    clearTimeout(this.timeoutId);
    this.visible = false;
  }
}
