import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type IconButtonVariant =
  | "ghost"
  | "soft"
  | "solid"
  | "danger"
  | "plain"
  | "outlined";

@Component({
  selector: "ds-icon-button",
  standalone: true,
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ds-icon-btn"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-haspopup]="haspopup || null"
      [attr.aria-expanded]="expanded === null ? null : expanded"
      (click)="clicked.emit($event)"
    >
      <ds-icon [name]="icon" [size]="iconSize" [stroke]="stroke" />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .ds-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--icon-btn-size, 36px);
        height: var(--icon-btn-size, 36px);
        border: none;
        border-radius: var(--icon-btn-radius, var(--ds-radius-lg));
        background: transparent;
        color: var(--icon-btn-color, var(--ds-text-muted));
        cursor: pointer;
        transition:
          background var(--ds-transition-fast),
          color var(--ds-transition-fast);
      }
      .ds-icon-btn:hover:not(:disabled) {
        background: var(--ds-surface-hover);
        color: var(--ds-text);
      }
      .ds-icon-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      :host([variant="soft"]) .ds-icon-btn {
        background: var(--ds-surface-inset);
      }
      :host([variant="solid"]) .ds-icon-btn {
        background: var(--ds-primary);
        color: var(--icon-btn-color, var(--ds-accent));
      }
      :host([variant="solid"]) .ds-icon-btn:hover:not(:disabled) {
        background: var(--ds-primary);
        color: var(--icon-btn-color, var(--ds-accent));
        filter: brightness(1.05);
      }
      :host([variant="outlined"]) .ds-icon-btn {
        background: var(--ds-surface);
        border: 1px solid var(--ds-border-input);
      }
      :host([variant="outlined"]) .ds-icon-btn:hover:not(:disabled) {
        background: var(--ds-surface-inset);
        color: var(--icon-btn-color, var(--ds-text));
      }
      :host([variant="danger"]) .ds-icon-btn:hover:not(:disabled) {
        background: var(--ds-danger-soft);
        color: var(--ds-danger);
      }
    `,
  ],
  host: {
    "[attr.variant]": "variant",
    "[style.--icon-btn-size.px]": "size",
    "[style.--icon-btn-color]": "color",
    "[style.--icon-btn-radius]": "radius",
  },
})
export class IconButtonComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() variant: IconButtonVariant = "ghost";
  @Input() size = 36;
  @Input() iconSize = 16;
  @Input() stroke = 2;
  @Input() color: string | null = null;
  @Input() radius: string | null = null;
  @Input() ariaLabel = "";
  @Input() disabled = false;
  @Input() haspopup: string | null = null;
  @Input() expanded: boolean | null = null;

  @Output() clicked = new EventEmitter<MouseEvent>();
}
