import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-impersonation-bar",
  imports: [IconComponent],
  template: `
    <div class="ib" role="status">
      <span class="ib__icon">
        <ds-icon name="eye" [size]="16"></ds-icon>
      </span>

      <div class="ib__body">
        <span class="ib__label">{{ label }}</span>
        <span class="ib__name">{{ name }}</span>
      </div>

      <button
        type="button"
        class="ib__exit"
        [attr.aria-label]="exitAriaLabel || exitLabel || null"
        (click)="exited.emit()"
      >
        {{ exitLabel }}
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ib {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        background: var(--ds-warning-soft);
        color: var(--ds-warning);
        border-bottom: 1px solid var(--ds-border);
        padding: var(--ds-space-2) var(--ds-space-3);
        padding-top: calc(var(--ds-space-2) + env(safe-area-inset-top));
      }
      .ib__icon {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-raised);
      }
      .ib__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .ib__label {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        opacity: 0.85;
      }
      .ib__name {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ib__exit {
        flex: 0 0 auto;
        appearance: none;
        cursor: pointer;
        border: 1px solid currentColor;
        border-radius: var(--ds-radius-pill);
        background: transparent;
        color: inherit;
        font-family: inherit;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.02em;
        padding: var(--ds-space-1) var(--ds-space-3);
      }
    `,
  ],
})
export class ImpersonationBarComponent {
  @Input() label = "";
  @Input() name = "";
  @Input() exitLabel = "";
  @Input() exitAriaLabel = "";
  @Output() exited = new EventEmitter<void>();
}
