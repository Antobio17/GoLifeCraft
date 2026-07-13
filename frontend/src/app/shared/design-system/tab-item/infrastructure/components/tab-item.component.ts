import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-tab-item",
  standalone: true,
  imports: [IconComponent],
  template: `
    <span class="tab" [class.tab--active]="active">
      <span class="tab__icon">
        <ds-icon [name]="icon" [size]="20" [stroke]="2.2" />
      </span>
      <span class="tab__label">{{ label }}</span>
    </span>
  `,
  styles: [
    `
      :host {
        flex: 1;
        display: block;
        cursor: pointer;
      }
      :host(.is-grow) {
        flex: 1.7;
      }
      .tab {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        padding: 9px 6px;
        border-radius: 14px;
        color: var(--ds-text-meta);
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.6, 0.05, 0.28, 0.98);
      }
      .tab__icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tab__label {
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
        white-space: nowrap;
        color: var(--ds-text);
        display: none;
      }
      .tab--active {
        gap: 8px;
        color: var(--ds-text);
        background: var(--ds-surface-inset);
      }
      .tab--active .tab__label {
        display: inline;
      }
    `,
  ],
  host: {
    "[class.is-grow]": "active",
  },
})
export class TabItemComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() label = "";
  @Input() active = false;
}
