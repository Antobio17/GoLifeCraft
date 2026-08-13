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
        gap: 0.3125rem;
        border: none;
        padding: 0.3125rem;
        font-size: 0.71875rem;
      }
      .ds-add--dashed {
        gap: 0.4375rem;
        border: 1.5px dashed var(--ds-border-strong);
        border-radius: 0.875rem;
        padding: 0.6875rem;
        font-size: 0.78125rem;
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
