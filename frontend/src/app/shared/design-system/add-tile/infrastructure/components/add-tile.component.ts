import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-add-tile",
  imports: [IconComponent],
  template: `
    <button type="button" class="ds-add" (click)="clicked.emit()">
      <span class="ds-add__line ds-add__line--start"></span>
      <span class="ds-add__badge">
        <ds-icon [name]="icon" [size]="15" [stroke]="2.5" />
      </span>
      <span class="ds-add__label">{{ label }}</span>
      <span class="ds-add__line ds-add__line--end"></span>
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
        gap: var(--ds-space-2);
        width: 100%;
        min-height: calc(2.125rem + 2 * var(--ds-space-1));
        box-sizing: border-box;
        padding: var(--ds-space-1);
        border: none;
        border-radius: var(--ds-radius-inner);
        background: none;
        cursor: pointer;
        color: var(--ds-primary-soft-text);
        font-family: var(--ds-font-body);
        font-weight: 700;
        font-size: var(--ds-text-sm);
        transition: var(--ds-motion-tint);
      }
      .ds-add:hover {
        background: var(--ds-surface-hover);
      }
      .ds-add:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .ds-add__line {
        flex: 1 1 0;
        min-width: var(--ds-space-3);
        height: 1px;
      }
      .ds-add__line--start {
        margin-right: var(--ds-space-1);
        background: linear-gradient(to right, transparent, var(--ds-border-strong));
      }
      .ds-add__line--end {
        margin-left: var(--ds-space-1);
        background: linear-gradient(to left, transparent, var(--ds-border-strong));
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
        transition: var(--ds-motion-tint), var(--ds-motion-press);
      }
      .ds-add:hover .ds-add__badge {
        background: var(--ds-primary-soft-hover);
      }
      .ds-add:active .ds-add__badge {
        transform: scale(0.92);
      }
      .ds-add__label {
        flex: 0 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class AddTileComponent {
  @Input() label = "";
  @Input() icon: DsIconName = "plus";

  @Output() clicked = new EventEmitter<void>();
}
