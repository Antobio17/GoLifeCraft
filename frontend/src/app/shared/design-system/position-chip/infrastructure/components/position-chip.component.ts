import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-position-chip",
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ds-poschip"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel"
      (click)="clicked.emit()"
    >
      <span class="ds-poschip__number">{{ position }}</span>
      @if (!disabled) {
        <ds-icon name="reorder" [size]="12" [stroke]="2.4" />
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .ds-poschip {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        appearance: none;
        cursor: pointer;
        font: inherit;
        padding: var(--ds-space-1) var(--ds-space-1-5) var(--ds-space-1)
          var(--ds-space-2);
        border: 1px solid transparent;
        border-radius: var(--ds-radius-sm);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        transition:
          border-color var(--ds-transition-fast),
          background var(--ds-transition-fast);
      }
      .ds-poschip:hover:not(:disabled) {
        border-color: var(--ds-primary);
      }
      .ds-poschip:disabled {
        cursor: default;
        padding: var(--ds-space-1) var(--ds-space-2);
      }
      .ds-poschip__number {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        line-height: 1.3;
      }
    `,
  ],
})
export class PositionChipComponent {
  @Input() position = 0;
  @Input() ariaLabel = "";
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<void>();
}
