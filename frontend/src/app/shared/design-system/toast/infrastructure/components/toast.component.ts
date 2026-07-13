import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type ToastType = "success" | "info" | "warning" | "error";

@Component({
  selector: "ds-toast",
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="toast" [class]="'toast--' + type">
      <span class="toast__icon">
        <ds-icon [name]="icon" [size]="20" [stroke]="2.3" />
      </span>

      <div class="toast__body">
        <div class="toast__title">{{ title }}</div>
        @if (subtitle) {
          <div class="toast__subtitle">{{ subtitle }}</div>
        }
      </div>

      <button
        type="button"
        class="toast__close"
        [attr.aria-label]="closeLabel || null"
        (click)="dismissed.emit()"
      >
        <ds-icon name="close" [size]="16" [stroke]="2.4" />
      </button>

      <span
        class="toast__progress"
        [style.animationDuration.ms]="durationMs"
      ></span>
    </div>
  `,
  styleUrls: ["./toast.component.css"],
})
export class ToastComponent {
  @Input() type: ToastType = "success";
  @Input() icon: DsIconName = "check";
  @Input() title = "";
  @Input() subtitle = "";
  @Input() durationMs = 4000;
  @Input() closeLabel = "";

  @Output() dismissed = new EventEmitter<void>();
}
