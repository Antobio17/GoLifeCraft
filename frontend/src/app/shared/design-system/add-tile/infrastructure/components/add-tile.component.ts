import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type AddTileVariant = "inline" | "dashed";

@Component({
  selector: "ds-add-tile",
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ds-add"
      [class.ds-add--inline]="variant === 'inline'"
      [class.ds-add--dashed]="variant === 'dashed'"
      (click)="clicked.emit()"
    >
      <ds-icon
        [name]="icon"
        [size]="variant === 'dashed' ? 16 : 14"
        [stroke]="2.4"
      />
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
        border: 1.5px dashed var(--ds-border-strong);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-3);
        font-size: var(--ds-text-base);
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
