import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type AddTileVariant = "inline" | "dashed";

@Component({
  selector: "ds-add-tile",
  standalone: true,
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
        gap: 5px;
        border: none;
        padding: 5px;
        font-size: 11.5px;
      }
      .ds-add--dashed {
        gap: 7px;
        border: 1.5px dashed var(--ds-border-strong);
        border-radius: 14px;
        padding: 11px;
        font-size: 12.5px;
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
