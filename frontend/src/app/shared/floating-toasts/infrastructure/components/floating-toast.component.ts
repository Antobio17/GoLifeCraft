import { Component, computed, inject } from "@angular/core";
import { trigger, style, animate, transition } from "@angular/animations";
import { FloatingToastService } from "../../application/services/floating-toast.service";
import {
  FloatingToastMessage,
  FloatingToastType,
} from "../../domain/models/floating-toast.model";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ToastComponent } from "@shared/design-system/toast/infrastructure/components/toast.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

interface FloatingToastView extends FloatingToastMessage {
  id: number;
  type: FloatingToastType;
  icon: DsIconName;
  durationMs: number;
}

const TOAST_ICONS: Record<FloatingToastType, DsIconName> = {
  success: "checkCircle",
  info: "info",
  warning: "alertCircle",
  error: "close",
};

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
  imports: [ContextualTranslatePipe, ToastComponent],
})
export class FloatingToastComponent {
  private floatingToastService = inject(FloatingToastService);

  readonly toasts = computed<FloatingToastView[]>(() => {
    const message = this.floatingToastService.getToast()();

    if (!message) {
      return [];
    }

    return [this.toView(message)];
  });

  asParams(
    details: Record<string, unknown> | unknown[],
  ): Record<string, unknown> | undefined {
    if (!details || Array.isArray(details)) return undefined;
    return details;
  }

  dismiss(): void {
    this.floatingToastService.dismiss();
  }

  private toView(message: FloatingToastMessage): FloatingToastView {
    const type = this.floatingToastService.typeOf(message);

    return {
      ...message,
      id: this.floatingToastService.getSequence()(),
      type,
      icon: TOAST_ICONS[type],
      durationMs: this.floatingToastService.durationOf(message),
    };
  }
}
