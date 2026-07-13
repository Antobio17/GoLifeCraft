import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-info-row",
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="ds-info">
      <span class="ds-info__label">
        @if (icon) {
          <ds-icon [name]="icon" [size]="12" [stroke]="2.5" />
        }
        {{ label }}
      </span>
      <span class="ds-info__value" [class.ds-info__value--bare]="bare"
        ><ng-content></ng-content
      ></span>
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .ds-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ds-info__label {
        font-size: 12px;
        color: var(--ds-text-disabled);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .ds-info__value {
        font-size: 13px;
        color: var(--ds-text-body);
        font-weight: 600;
        background: var(--ds-surface-subtle);
        border: 1px solid var(--ds-border);
        padding: 4px 12px;
        border-radius: 20px;
      }
      .ds-info__value--bare {
        background: none;
        border: none;
        padding: 0;
      }
    `,
  ],
})
export class InfoRowComponent {
  @Input() label = "";
  @Input() icon?: DsIconName;
  @Input() bare = false;
}
