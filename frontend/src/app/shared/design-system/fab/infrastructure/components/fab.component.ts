import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-fab",
  standalone: true,
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ds-fab"
      [class.ds-fab--extended]="!!label"
      [attr.aria-label]="label || ariaLabel || null"
      (click)="clicked.emit()"
    >
      <ds-icon [name]="icon" [size]="18" [stroke]="2.6" />
      @if (label) {
        <span class="ds-fab__label">{{ label }}</span>
      }
    </button>
  `,
  styles: [
    `
      :host {
        position: sticky;
        bottom: calc(72px + 12px + env(safe-area-inset-bottom));
        display: flex;
        justify-content: flex-end;
        pointer-events: none;
        z-index: 20;
      }
      @media (min-width: 768px) {
        :host {
          bottom: 20px;
        }
      }
      .ds-fab {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: none;
        cursor: pointer;
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        border-radius: var(--ds-radius-pill);
        box-shadow: var(--ds-shadow-float);
        transition:
          background var(--ds-transition-fast),
          transform var(--ds-transition-fast);
      }
      .ds-fab:not(.ds-fab--extended) {
        width: 52px;
        height: 52px;
        justify-content: center;
      }
      .ds-fab--extended {
        height: 48px;
        padding: 0 18px;
        border-radius: 15px;
      }
      .ds-fab ds-icon {
        color: var(--ds-accent);
      }
      :host-context([data-theme="dark"]) .ds-fab ds-icon {
        color: var(--ds-on-primary);
      }
      .ds-fab:hover {
        background: var(--ds-primary-hover);
      }
      .ds-fab:active {
        transform: scale(0.96);
      }
      .ds-fab__label {
        font-size: var(--ds-text-label);
        font-weight: var(--ds-weight-bold);
      }
    `,
  ],
})
export class FabComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() label = "";
  @Input() ariaLabel = "";

  @Output() clicked = new EventEmitter<void>();
}
