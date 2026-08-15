import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-fab",
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
        bottom: calc(
          var(--ds-app-bottom-nav-height) + var(--ds-space-3) +
            env(safe-area-inset-bottom)
        );
        display: flex;
        justify-content: flex-end;
        pointer-events: none;
        z-index: 20;
      }
      @media (min-width: 768px) {
        :host {
          bottom: 1.25rem;
        }
      }
      .ds-fab {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-2);
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
        width: 3.25rem;
        height: 3.25rem;
        justify-content: center;
      }
      .ds-fab--extended {
        height: 3rem;
        padding: 0 var(--ds-space-4);
        border-radius: var(--ds-radius-xl);
      }
      .ds-fab ds-icon {
        color: var(--ds-on-primary);
      }
      .ds-fab:hover {
        background: var(--ds-primary-hover);
      }
      .ds-fab:active {
        transform: scale(0.96);
      }
      .ds-fab__label {
        font-size: var(--ds-text-md);
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
