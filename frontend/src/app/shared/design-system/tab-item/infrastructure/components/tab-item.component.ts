import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-tab-item",
  imports: [IconComponent],
  host: { "[class.ds-tab-item--active]": "active" },
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
        flex: 1 1 0;
        display: block;
        cursor: pointer;
        min-width: 0;
      }
      :host(.ds-tab-item--active) {
        flex: 0 1 auto;
      }
      .tab {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        padding: var(--ds-space-3) var(--ds-space-1-5);
        border-radius: var(--ds-radius-lg);
        color: var(--ds-text-muted);
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.6, 0.05, 0.28, 0.98);
      }
      .tab__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }
      .tab__label {
        max-width: 0;
        overflow: hidden;
        opacity: 0;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
        letter-spacing: var(--ds-tracking-tight);
        line-height: 1;
        white-space: nowrap;
        transition: all 0.3s cubic-bezier(0.6, 0.05, 0.28, 0.98);
      }
      .tab--active {
        gap: var(--ds-space-2);
        color: var(--ds-text);
        background: var(--ds-surface-inset);
      }
      .tab--active .tab__label {
        max-width: 5rem;
        opacity: 1;
      }
    `,
  ],
})
export class TabItemComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() label = "";
  @Input() active = false;
}
