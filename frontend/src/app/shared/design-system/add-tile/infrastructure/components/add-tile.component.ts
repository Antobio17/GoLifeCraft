import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type AddTileVariant = "inline" | "dashed" | "row";

@Component({
  selector: "ds-add-tile",
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ds-add"
      [class.ds-add--inline]="variant === 'inline'"
      [class.ds-add--dashed]="variant === 'dashed'"
      [class.ds-add--row]="variant === 'row'"
      (click)="clicked.emit()"
    >
      @if (variant === "row") {
        <span class="ds-add__badge">
          <ds-icon [name]="icon" [size]="15" [stroke]="2.5" />
        </span>
      } @else {
        <ds-icon
          [name]="icon"
          [size]="variant === 'dashed' ? 16 : 14"
          [stroke]="2.4"
        />
      }
      <span>{{ label }}</span>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-add {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        cursor: pointer;
        background: none;
        color: var(--ds-primary);
        font-family: var(--ds-font-body);
        font-weight: 700;
      }
      .ds-add--inline {
        gap: var(--ds-space-1);
        border: none;
        padding: var(--ds-space-1);
        font-size: var(--ds-text-sm);
      }
      .ds-add--dashed {
        gap: var(--ds-space-1-5);
        border: 1.5px dashed var(--ds-border);
        border-radius: var(--add-tile-radius, var(--ds-radius-surface));
        padding: var(--ds-space-2);
        font-size: var(--ds-text-base);
      }
      .ds-add--row {
        justify-content: flex-start;
        gap: var(--ds-space-1-5);
        min-height: calc(2.125rem + 2 * var(--ds-space-1));
        padding: var(--ds-space-1);
        border: none;
        border-radius: var(--ds-radius-inner);
        color: var(--ds-primary-soft-text);
        font-size: var(--ds-text-sm);
        transition: var(--ds-motion-tint), var(--ds-motion-press);
      }
      .ds-add--row:hover {
        background: var(--ds-surface-hover);
      }
      .ds-add--row:active {
        transform: scale(0.98);
      }
      .ds-add--row:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .ds-add__badge {
        width: 2rem;
        height: 2rem;
        flex: 0 0 auto;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-inner);
        background: var(--ds-primary-soft);
        border: 1.5px solid var(--ds-primary-soft-border);
        transition: var(--ds-motion-tint);
      }
      .ds-add--row:hover .ds-add__badge {
        background: var(--ds-primary-soft-hover);
      }
    `,
  ],
})
export class AddTileComponent {
  @Input() label = "";
  @Input() variant: AddTileVariant = "inline";
  @Input() icon: DsIconName = "plus";

  @Output() clicked = new EventEmitter<void>();
}
